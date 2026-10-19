using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LearningPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    DailyGoalMinutes = table.Column<int>(type: "int", nullable: false),
                    AllowSkippingPrerequisites = table.Column<bool>(type: "bit", nullable: false),
                    FocusSkill = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    WeekStartsOn = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningPreferences", x => x.Id);
                    table.CheckConstraint("CK_LearningPreference_Goal", "DailyGoalMinutes BETWEEN 10 AND 600");
                });

            migrationBuilder.CreateTable(
                name: "Phases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DescriptionAr = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Phases", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PortfolioChecklistItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DescriptionAr = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioChecklistItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Resources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SourceName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IsFree = table.Column<bool>(type: "bit", nullable: false),
                    VerificationStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    LastVerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastStatusCode = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SummaryEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummaryAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequirementsEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequirementsAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStack = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartAfterPhaseId = table.Column<int>(type: "int", nullable: false),
                    RepositoryUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_Phases_StartAfterPhaseId",
                        column: x => x.StartAfterPhaseId,
                        principalTable: "Phases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Topics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    PhaseId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SummaryEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummaryAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WhyEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WhyAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HowEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HowAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExampleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExampleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodeSample = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CodeLanguage = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PracticeTaskEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PracticeTaskAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChallengeEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChallengeAr = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Topics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Topics_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PortfolioChecks",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ChecklistItemId = table.Column<int>(type: "int", nullable: false),
                    IsDone = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioChecks", x => new { x.ProjectId, x.ChecklistItemId });
                    table.ForeignKey(
                        name: "FK_PortfolioChecks_PortfolioChecklistItems_ChecklistItemId",
                        column: x => x.ChecklistItemId,
                        principalTable: "PortfolioChecklistItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PortfolioChecks_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectMilestones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DescriptionAr = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectMilestones_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    QuestionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    QuestionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AnswerEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnswerAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExampleCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FollowUpEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FollowUpAr = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewQuestions_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PracticeExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ProblemEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProblemAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CodeLanguage = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ExpectedOutcomeEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedOutcomeAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HintsEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HintsAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SolutionEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SolutionAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SolutionCode = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeExercises_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ResourceTopics",
                columns: table => new
                {
                    ResourceId = table.Column<int>(type: "int", nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceTopics", x => new { x.ResourceId, x.TopicId });
                    table.ForeignKey(
                        name: "FK_ResourceTopics_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResourceTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReviewSchedules",
                columns: table => new
                {
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    IntervalDays = table.Column<int>(type: "int", nullable: false),
                    NextReviewOn = table.Column<DateOnly>(type: "date", nullable: false),
                    LastReviewedOn = table.Column<DateOnly>(type: "date", nullable: true),
                    ReviewCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewSchedules", x => x.TopicId);
                    table.ForeignKey(
                        name: "FK_ReviewSchedules_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TopicPrerequisites",
                columns: table => new
                {
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    PrerequisiteTopicId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicPrerequisites", x => new { x.TopicId, x.PrerequisiteTopicId });
                    table.CheckConstraint("CK_TopicPrerequisite_NotSelf", "TopicId <> PrerequisiteTopicId");
                    table.ForeignKey(
                        name: "FK_TopicPrerequisites_Topics_PrerequisiteTopicId",
                        column: x => x.PrerequisiteTopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TopicPrerequisites_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TopicProgress",
                columns: table => new
                {
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Knowledge = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Confidence = table.Column<int>(type: "int", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicProgress", x => x.TopicId);
                    table.CheckConstraint("CK_TopicProgress_Confidence", "Confidence IS NULL OR (Confidence >= 0 AND Confidence <= 5)");
                    table.ForeignKey(
                        name: "FK_TopicProgress_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    MilestoneId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DescriptionAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AcceptanceCriteriaEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AcceptanceCriteriaAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IsChangeRequest = table.Column<bool>(type: "bit", nullable: false),
                    UnlockAtPercent = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTasks", x => x.Id);
                    table.CheckConstraint("CK_ProjectTask_UnlockPercent", "UnlockAtPercent BETWEEN 0 AND 100");
                    table.ForeignKey(
                        name: "FK_ProjectTasks_ProjectMilestones_MilestoneId",
                        column: x => x.MilestoneId,
                        principalTable: "ProjectMilestones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewProgress",
                columns: table => new
                {
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    TimesPracticed = table.Column<int>(type: "int", nullable: false),
                    LastPracticedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewProgress", x => x.QuestionId);
                    table.ForeignKey(
                        name: "FK_InterviewProgress_InterviewQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "InterviewQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticeProgress",
                columns: table => new
                {
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    UserAnswer = table.Column<string>(type: "nvarchar(max)", maxLength: 10000, nullable: true),
                    HintsRevealed = table.Column<int>(type: "int", nullable: false),
                    SolutionRevealed = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeProgress", x => x.ExerciseId);
                    table.ForeignKey(
                        name: "FK_PracticeProgress_PracticeExercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "PracticeExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", maxLength: 20000, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    ProjectTaskId = table.Column<int>(type: "int", nullable: true),
                    InterviewQuestionId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.CheckConstraint("CK_Note_SingleLink", "(CASE WHEN TopicId IS NULL THEN 0 ELSE 1 END + CASE WHEN ProjectId IS NULL THEN 0 ELSE 1 END + CASE WHEN ProjectTaskId IS NULL THEN 0 ELSE 1 END + CASE WHEN InterviewQuestionId IS NULL THEN 0 ELSE 1 END) <= 1");
                    table.ForeignKey(
                        name: "FK_Notes_InterviewQuestions_InterviewQuestionId",
                        column: x => x.InterviewQuestionId,
                        principalTable: "InterviewQuestions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_ProjectTasks_ProjectTaskId",
                        column: x => x.ProjectTaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectTaskProgress",
                columns: table => new
                {
                    ProjectTaskId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    BlockedReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTaskProgress", x => x.ProjectTaskId);
                    table.ForeignKey(
                        name: "FK_ProjectTaskProgress_ProjectTasks_ProjectTaskId",
                        column: x => x.ProjectTaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTaskTopics",
                columns: table => new
                {
                    ProjectTaskId = table.Column<int>(type: "int", nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTaskTopics", x => new { x.ProjectTaskId, x.TopicId });
                    table.ForeignKey(
                        name: "FK_ProjectTaskTopics_ProjectTasks_ProjectTaskId",
                        column: x => x.ProjectTaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTaskTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudySessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TopicId = table.Column<int>(type: "int", nullable: true),
                    ProjectTaskId = table.Column<int>(type: "int", nullable: true),
                    PlannedMinutes = table.Column<int>(type: "int", nullable: true),
                    ActualMinutes = table.Column<int>(type: "int", nullable: false),
                    SessionDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudySessions", x => x.Id);
                    table.CheckConstraint("CK_StudySession_Minutes", "ActualMinutes > 0 AND ActualMinutes <= 1440");
                    table.CheckConstraint("CK_StudySession_Planned", "PlannedMinutes IS NULL OR (PlannedMinutes > 0 AND PlannedMinutes <= 1440)");
                    table.ForeignKey(
                        name: "FK_StudySessions_ProjectTasks_ProjectTaskId",
                        column: x => x.ProjectTaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_StudySessions_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewQuestions_Category_TopicId",
                table: "InterviewQuestions",
                columns: new[] { "Category", "TopicId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewQuestions_Key",
                table: "InterviewQuestions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewQuestions_TopicId",
                table: "InterviewQuestions",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_InterviewQuestionId",
                table: "Notes",
                column: "InterviewQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ProjectId",
                table: "Notes",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ProjectTaskId",
                table: "Notes",
                column: "ProjectTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_TopicId",
                table: "Notes",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UpdatedAt",
                table: "Notes",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Phases_Slug",
                table: "Phases",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioChecklistItems_Key",
                table: "PortfolioChecklistItems",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioChecks_ChecklistItemId",
                table: "PortfolioChecks",
                column: "ChecklistItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeExercises_Key",
                table: "PracticeExercises",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PracticeExercises_TopicId",
                table: "PracticeExercises",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeExercises_Type_TopicId",
                table: "PracticeExercises",
                columns: new[] { "Type", "TopicId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMilestones_Key",
                table: "ProjectMilestones",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMilestones_ProjectId_Order",
                table: "ProjectMilestones",
                columns: new[] { "ProjectId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Slug",
                table: "Projects",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_StartAfterPhaseId",
                table: "Projects",
                column: "StartAfterPhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_Key",
                table: "ProjectTasks",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_MilestoneId_Order",
                table: "ProjectTasks",
                columns: new[] { "MilestoneId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTaskTopics_TopicId",
                table: "ProjectTaskTopics",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Resources_Key",
                table: "Resources",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resources_Url",
                table: "Resources",
                column: "Url",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResourceTopics_TopicId",
                table: "ResourceTopics",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewSchedules_NextReviewOn",
                table: "ReviewSchedules",
                column: "NextReviewOn");

            migrationBuilder.CreateIndex(
                name: "IX_StudySessions_ProjectTaskId",
                table: "StudySessions",
                column: "ProjectTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_StudySessions_SessionDate",
                table: "StudySessions",
                column: "SessionDate");

            migrationBuilder.CreateIndex(
                name: "IX_StudySessions_TopicId",
                table: "StudySessions",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_TopicPrerequisites_PrerequisiteTopicId",
                table: "TopicPrerequisites",
                column: "PrerequisiteTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_TopicProgress_Status",
                table: "TopicProgress",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Topics_PhaseId_Order",
                table: "Topics",
                columns: new[] { "PhaseId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_Topics_Skill",
                table: "Topics",
                column: "Skill");

            migrationBuilder.CreateIndex(
                name: "IX_Topics_Slug",
                table: "Topics",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InterviewProgress");

            migrationBuilder.DropTable(
                name: "LearningPreferences");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "PortfolioChecks");

            migrationBuilder.DropTable(
                name: "PracticeProgress");

            migrationBuilder.DropTable(
                name: "ProjectTaskProgress");

            migrationBuilder.DropTable(
                name: "ProjectTaskTopics");

            migrationBuilder.DropTable(
                name: "ResourceTopics");

            migrationBuilder.DropTable(
                name: "ReviewSchedules");

            migrationBuilder.DropTable(
                name: "StudySessions");

            migrationBuilder.DropTable(
                name: "TopicPrerequisites");

            migrationBuilder.DropTable(
                name: "TopicProgress");

            migrationBuilder.DropTable(
                name: "InterviewQuestions");

            migrationBuilder.DropTable(
                name: "PortfolioChecklistItems");

            migrationBuilder.DropTable(
                name: "PracticeExercises");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropTable(
                name: "ProjectTasks");

            migrationBuilder.DropTable(
                name: "Topics");

            migrationBuilder.DropTable(
                name: "ProjectMilestones");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Phases");
        }
    }
}
