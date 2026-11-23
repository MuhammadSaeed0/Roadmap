using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>Quick review flashcards: built from a topic's quiz questions and objectives; the review schedule stays the source of truth.</summary>
public class QuickReviewTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private static QuizQuestion Question(int n) => new()
    {
        Key = "q" + n, TopicId = 1, QuestionEn = $"Question {n}?", QuestionAr = $"سؤال {n}؟",
        OptionsEn = ["a", "b", "c", "d"], OptionsAr = ["أ", "ب", "ج", "د"], AnswerIndex = n % 4,
        ExplanationEn = $"Because {n}. More detail.", ExplanationAr = $"لأن {n}. تفاصيل أكثر.",
    };

    [Fact]
    public void Builds_one_objective_card_then_questions_with_the_right_answer_and_a_one_line_why()
    {
        var questions = Enumerable.Range(1, 6).Select(Question).ToList();
        var cards = ReviewService.BuildCards("Summary.", "ملخص.", "It matters. Really.", "مهم. فعلًا.",
            "Write a record\nCompare by value", "اكتب record\nقارن بالقيمة", questions, new Random(3));

        Assert.Equal(ReviewService.CardsPerTopic, cards.Count);
        var objective = cards[0];
        Assert.Equal("objective", objective.Kind);
        Assert.Contains(objective.FrontEn, new[] { "Write a record", "Compare by value" });
        Assert.Equal("Summary.", objective.BackEn);
        Assert.Equal("It matters.", objective.WhyEn);
        Assert.Equal("مهم.", objective.WhyAr);

        Assert.All(cards.Skip(1), card =>
        {
            Assert.Equal("question", card.Kind);
            var q = questions.Single(x => x.QuestionEn == card.FrontEn);
            Assert.Equal(q.OptionsEn[q.AnswerIndex], card.BackEn);
            Assert.Equal(q.OptionsAr[q.AnswerIndex], card.BackAr);
            Assert.Equal(q.ExplanationEn.Split(". ")[0] + ".", card.WhyEn);
        });
        Assert.Equal(3, cards.Skip(1).Select(c => c.FrontEn).Distinct().Count());
    }

    [Fact]
    public void Without_objectives_every_card_is_a_question_and_few_questions_give_a_short_deck()
    {
        var full = ReviewService.BuildCards("S", "م", "W", "ل", "", "", Enumerable.Range(1, 8).Select(Question).ToList(), new Random(1));
        Assert.Equal(ReviewService.CardsPerTopic, full.Count);
        Assert.All(full, c => Assert.Equal("question", c.Kind));

        var small = ReviewService.BuildCards("S", "م", "W", "ل", "", "", [Question(1), Question(2), Question(3)], new Random(1));
        Assert.Equal(3, small.Count);
    }

    [Theory]
    [InlineData("Records compare by value. So two equal records are equal.", "Records compare by value.")]
    [InlineData("Use a version, e.g. net10.0 for .NET 10. Then build.", "Use a version, e.g. net10.0 for .NET 10.")]
    [InlineData("One sentence only", "One sentence only")]
    [InlineData("هل هذا صحيح؟ نعم.", "هل هذا صحيح؟")]
    public void First_sentence_keeps_a_one_line_why(string text, string expected) =>
        Assert.Equal(expected, ReviewService.FirstSentence(text));

    [Fact]
    public async Task Seeded_topics_give_cards_from_their_own_quiz_and_objectives()
    {
        var client = await factory.CreateUserClientAsync();
        int withObjectives, without;
        Dictionary<string, string> answers;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            withObjectives = await db.Topics.Where(t => t.ObjectivesEn != "").OrderBy(t => t.Id).Select(t => t.Id).FirstAsync();
            without = await db.Topics.Where(t => t.ObjectivesEn == "").OrderBy(t => t.Id).Select(t => t.Id).FirstAsync();
            answers = (await db.QuizQuestions.Where(q => q.TopicId == withObjectives || q.TopicId == without).ToListAsync())
                .ToDictionary(q => q.QuestionEn, q => q.OptionsEn[q.AnswerIndex]);
        }

        var deck = await Json(await client.GetAsync($"/api/reviews/{withObjectives}/cards"));
        var cards = deck["cards"]!.AsArray();
        Assert.Equal(withObjectives, deck["topicId"]!.GetValue<int>());
        Assert.InRange(cards.Count, 3, 5);
        Assert.Equal("objective", cards[0]!["kind"]!.GetValue<string>());
        foreach (var card in cards.Skip(1))
        {
            Assert.Equal("question", card!["kind"]!.GetValue<string>());
            Assert.Equal(answers[card["frontEn"]!.GetValue<string>()], card["backEn"]!.GetValue<string>());
            Assert.False(string.IsNullOrWhiteSpace(card["whyAr"]!.GetValue<string>()));
        }

        var plain = (await Json(await client.GetAsync($"/api/reviews/{without}/cards")))["cards"]!.AsArray();
        Assert.All(plain, c => Assert.Equal("question", c!["kind"]!.GetValue<string>()));
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/reviews/999999/cards")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateClient().GetAsync($"/api/reviews/{without}/cards")).StatusCode);
    }

    [Fact]
    public async Task Finishing_a_quick_review_reschedules_through_the_existing_endpoint()
    {
        var client = await factory.CreateUserClientAsync();
        int topicId;
        using (var scope = factory.Services.CreateScope())
            topicId = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Topics.OrderBy(t => t.Id).Select(t => t.Id).Skip(4).FirstAsync();

        (await client.PutAsync($"/api/reviews/{topicId}", null)).EnsureSuccessStatusCode();
        // Reading the cards changes nothing.
        await Json(await client.GetAsync($"/api/reviews/{topicId}/cards"));
        var queue = await Json(await client.GetAsync("/api/reviews"));
        var before = queue["upcoming"]!.AsArray().Concat(queue["due"]!.AsArray()).Single(i => i!["topicId"]!.GetValue<int>() == topicId)!;
        Assert.Equal(0, before["reviewCount"]!.GetValue<int>());

        // The page derives confidence 4 from Good and Easy answers and completes the review.
        var state = await Json(await client.PostAsJsonAsync($"/api/reviews/{topicId}/complete", new { confidence = 4 }));
        Assert.Equal(8, state["intervalDays"]!.GetValue<int>());
        Assert.Equal(1, state["reviewCount"]!.GetValue<int>());
        var last = DateOnly.Parse(state["lastReviewedOn"]!.GetValue<string>());
        Assert.Equal(last.AddDays(8), DateOnly.Parse(state["nextReviewOn"]!.GetValue<string>()));

        var topic = await Json(await client.GetAsync($"/api/topics/{topicId}"));
        Assert.Equal(4, topic["confidence"]!.GetValue<int>());
    }
}
