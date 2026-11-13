using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevPath.Api.Data;

/// <summary>
/// Content tables are shared by everyone. User tables are private: each one is filtered to
/// <see cref="CurrentUserId"/>, so a query can't return another account's rows even if a
/// service forgets a Where clause, and an id in a URL can only reach the caller's own data.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUser? currentUser = null)
    : IdentityDbContext<AppUser>(options), IDataProtectionKeyContext
{
    /// <summary>The signed-in user's id, or null outside a request (start-up, seeding): user tables then read as empty.</summary>
    public string? CurrentUserId => currentUser?.Id;

    // Content (seeded)
    public DbSet<Phase> Phases => Set<Phase>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<TopicDemand> TopicDemand => Set<TopicDemand>();
    public DbSet<TopicPrerequisite> TopicPrerequisites => Set<TopicPrerequisite>();
    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<ResourceTopic> ResourceTopics => Set<ResourceTopic>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMilestone> ProjectMilestones => Set<ProjectMilestone>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    public DbSet<ProjectTaskTopic> ProjectTaskTopics => Set<ProjectTaskTopic>();
    public DbSet<PortfolioChecklistItem> PortfolioChecklistItems => Set<PortfolioChecklistItem>();
    public DbSet<PracticeExercise> PracticeExercises => Set<PracticeExercise>();
    public DbSet<InterviewQuestion> InterviewQuestions => Set<InterviewQuestion>();
    public DbSet<CuratedVideo> CuratedVideos => Set<CuratedVideo>();
    public DbSet<ProjectTaskVideo> ProjectTaskVideos => Set<ProjectTaskVideo>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<TopicLesson> TopicLessons => Set<TopicLesson>();

    // User data
    public DbSet<TopicProgress> TopicProgress => Set<TopicProgress>();
    public DbSet<StudySession> StudySessions => Set<StudySession>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<ProjectTaskProgress> ProjectTaskProgress => Set<ProjectTaskProgress>();
    public DbSet<PortfolioCheck> PortfolioChecks => Set<PortfolioCheck>();
    public DbSet<PracticeProgress> PracticeProgress => Set<PracticeProgress>();
    public DbSet<InterviewProgress> InterviewProgress => Set<InterviewProgress>();
    public DbSet<ReviewSchedule> ReviewSchedules => Set<ReviewSchedule>();
    public DbSet<LearningPreference> LearningPreferences => Set<LearningPreference>();
    public DbSet<ProjectRepository> ProjectRepositories => Set<ProjectRepository>();
    public DbSet<UserTopicVideo> UserTopicVideos => Set<UserTopicVideo>();
    public DbSet<VideoProgress> VideoProgress => Set<VideoProgress>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAnswer> QuizAnswers => Set<QuizAnswer>();
    public DbSet<XpTransaction> XpTransactions => Set<XpTransaction>();
    public DbSet<ProjectAssessment> ProjectAssessments => Set<ProjectAssessment>();
    public DbSet<LevelChange> LevelChanges => Set<LevelChange>();
    public DbSet<PracticeSubmission> PracticeSubmissions => Set<PracticeSubmission>();
    public DbSet<PlaygroundProject> PlaygroundProjects => Set<PlaygroundProject>();
    public DbSet<CvDocument> CvDocuments => Set<CvDocument>();

    // Accounts and administration (not filtered per user: only auth and admin code reads them)
    public DbSet<AccountToken> AccountTokens => Set<AccountToken>();
    public DbSet<AdminAuditEntry> AdminAudit => Set<AdminAuditEntry>();
    /// <summary>ASP.NET Core data-protection keys (they sign the auth cookie), kept in the database so they survive app restarts on shared hosting.</summary>
    public DbSet<Microsoft.AspNetCore.DataProtection.EntityFrameworkCore.DataProtectionKey> DataProtectionKeys => Set<Microsoft.AspNetCore.DataProtection.EntityFrameworkCore.DataProtectionKey>();

    // Community
    public DbSet<Discussion> Discussions => Set<Discussion>();
    public DbSet<DiscussionReply> DiscussionReplies => Set<DiscussionReply>();
    public DbSet<DiscussionVote> DiscussionVotes => Set<DiscussionVote>();
    public DbSet<Notification> Notifications => Set<Notification>();

    // Learning paths
    public DbSet<LearningPath> LearningPaths => Set<LearningPath>();
    public DbSet<LearningPathPhase> LearningPathPhases => Set<LearningPathPhase>();
    public DbSet<LearningPathTopic> LearningPathTopics => Set<LearningPathTopic>();
    public DbSet<UserLearningPath> UserLearningPaths => Set<UserLearningPath>();

    // Shared caches
    public DbSet<TopicVideoCache> TopicVideoCache => Set<TopicVideoCache>();

    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        // Store every enum as a readable string such as 'Completed' instead of 2.
        builder.Properties<Enum>().HaveConversion<string>().HaveMaxLength(32);
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);   // Identity tables (AspNetUsers, AspNetRoles…)

        // ---------- Accounts ----------
        b.Entity<AppUser>(e =>
        {
            e.Property(x => x.FullName).HasMaxLength(100);
            e.Property(x => x.StatusReason).HasMaxLength(500);
            e.Property(x => x.StatusChangedById).HasMaxLength(450);
            e.Property(x => x.ApprovedById).HasMaxLength(450);
            e.HasIndex(x => x.Status);
            // Only one account can ever be the main administrator.
            e.HasIndex(x => x.IsOwner).IsUnique().HasFilter("[IsOwner] = 1");
        });
        b.Entity<AccountToken>(e =>
        {
            e.Property(x => x.UserId).HasMaxLength(450);
            e.Property(x => x.TokenHash).HasMaxLength(64);
            e.HasIndex(x => x.TokenHash).IsUnique();
            e.HasIndex(x => new { x.UserId, x.Purpose });
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<AdminAuditEntry>(e =>
        {
            e.Property(x => x.ActorId).HasMaxLength(450);
            e.Property(x => x.ActorEmail).HasMaxLength(256);
            e.Property(x => x.Action).HasMaxLength(64);
            e.Property(x => x.TargetUserId).HasMaxLength(450);
            e.Property(x => x.TargetEmail).HasMaxLength(256);
            e.Property(x => x.Details).HasMaxLength(1000);
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.TargetUserId);
        });

        // ---------- Content ----------
        b.Entity<Phase>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
            e.Property(x => x.DescriptionEn).HasMaxLength(1000);
            e.Property(x => x.DescriptionAr).HasMaxLength(1000);
        });

        b.Entity<TopicDemand>(e =>
        {
            e.Property(x => x.Technology).HasMaxLength(80);
            e.Property(x => x.Run).HasMaxLength(20);
            e.Property(x => x.PeriodFrom).HasMaxLength(10);
            e.Property(x => x.PeriodTo).HasMaxLength(10);
            e.HasIndex(x => x.TopicId);
            e.HasOne(x => x.Topic).WithMany(t => t.Demand).HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Topic>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasIndex(x => new { x.PhaseId, x.Order });
            e.HasIndex(x => x.Skill);
            e.Property(x => x.Slug).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
            e.Property(x => x.CodeLanguage).HasMaxLength(20);
            e.Property(x => x.Difficulty).HasMaxLength(20);
            e.HasOne(x => x.Phase).WithMany(p => p.Topics)
                .HasForeignKey(x => x.PhaseId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<TopicPrerequisite>(e =>
        {
            e.HasKey(x => new { x.TopicId, x.PrerequisiteTopicId });
            e.HasOne(x => x.Topic).WithMany(t => t.Prerequisites)
                .HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
            // Second FK to the same table must not cascade (SQL Server forbids multiple cascade paths).
            e.HasOne(x => x.PrerequisiteTopic).WithMany(t => t.RequiredBy)
                .HasForeignKey(x => x.PrerequisiteTopicId).OnDelete(DeleteBehavior.Restrict);
            e.ToTable(t => t.HasCheckConstraint("CK_TopicPrerequisite_NotSelf", "TopicId <> PrerequisiteTopicId"));
        });

        b.Entity<Resource>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => x.Url).IsUnique();
            e.Property(x => x.Key).HasMaxLength(80);
            e.Property(x => x.Url).HasMaxLength(500);
            e.Property(x => x.TitleEn).HasMaxLength(250);
            e.Property(x => x.TitleAr).HasMaxLength(250);
            e.Property(x => x.SourceName).HasMaxLength(100);
        });

        b.Entity<ResourceTopic>(e =>
        {
            e.HasKey(x => new { x.ResourceId, x.TopicId });
            e.HasIndex(x => x.TopicId);
            e.HasOne(x => x.Resource).WithMany(r => r.TopicLinks).HasForeignKey(x => x.ResourceId);
            e.HasOne(x => x.Topic).WithMany(t => t.ResourceLinks).HasForeignKey(x => x.TopicId);
        });

        b.Entity<Project>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
            e.Property(x => x.TechStack).HasMaxLength(200);
            e.HasOne(x => x.StartAfterPhase).WithMany()
                .HasForeignKey(x => x.StartAfterPhaseId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<ProjectMilestone>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => new { x.ProjectId, x.Order });
            e.Property(x => x.Key).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
            e.HasOne(x => x.Project).WithMany(p => p.Milestones)
                .HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<ProjectTask>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => new { x.MilestoneId, x.Order });
            e.Property(x => x.Key).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(250);
            e.Property(x => x.TitleAr).HasMaxLength(250);
            e.HasOne(x => x.Milestone).WithMany(m => m.Tasks)
                .HasForeignKey(x => x.MilestoneId).OnDelete(DeleteBehavior.Restrict);
            e.ToTable(t => t.HasCheckConstraint("CK_ProjectTask_UnlockPercent", "UnlockAtPercent BETWEEN 0 AND 100"));
        });

        b.Entity<ProjectTaskTopic>(e =>
        {
            e.HasKey(x => new { x.ProjectTaskId, x.TopicId });
            e.HasIndex(x => x.TopicId);
            e.HasOne(x => x.ProjectTask).WithMany(t => t.TopicLinks).HasForeignKey(x => x.ProjectTaskId);
            e.HasOne(x => x.Topic).WithMany(t => t.ProjectTaskLinks).HasForeignKey(x => x.TopicId);
        });

        b.Entity<PortfolioChecklistItem>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.Property(x => x.Key).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
        });

        b.Entity<PracticeExercise>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => new { x.Type, x.TopicId });
            e.Property(x => x.Key).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(250);
            e.Property(x => x.TitleAr).HasMaxLength(250);
            e.Property(x => x.CodeLanguage).HasMaxLength(20);
            e.Property(x => x.Dataset).HasMaxLength(40);
            e.Property(x => x.Technologies).HasMaxLength(200);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<InterviewQuestion>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => new { x.Category, x.TopicId });
            e.Property(x => x.Key).HasMaxLength(80);
            e.Property(x => x.QuestionEn).HasMaxLength(500);
            e.Property(x => x.QuestionAr).HasMaxLength(500);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<CuratedVideo>(e =>
        {
            e.HasIndex(x => new { x.TopicId, x.VideoId }).IsUnique();
            e.Property(x => x.VideoId).HasMaxLength(11);
            e.Property(x => x.Title).HasMaxLength(300);
            e.Property(x => x.ChannelTitle).HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(500);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- User data ----------
        // Every user-owned table gets: a UserId foreign key to AspNetUsers (deleting an
        // account deletes its data) and a query filter on the signed-in user's id.
        b.Entity<TopicProgress>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.TopicId });
            e.HasIndex(x => new { x.UserId, x.Status });
            e.HasOne(x => x.Topic).WithMany(t => t.ProgressRows)
                .HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
            e.ToTable(t => t.HasCheckConstraint("CK_TopicProgress_Confidence", "Confidence IS NULL OR (Confidence >= 0 AND Confidence <= 5)"));
        });

        b.Entity<StudySession>(e =>
        {
            OwnedByUser(e);
            e.HasIndex(x => new { x.UserId, x.SessionDate });
            e.HasIndex(x => x.TopicId);
            e.Property(x => x.Note).HasMaxLength(1000);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.ClientSetNull);
            e.HasOne(x => x.ProjectTask).WithMany().HasForeignKey(x => x.ProjectTaskId).OnDelete(DeleteBehavior.ClientSetNull);
            e.ToTable(t =>
            {
                t.HasCheckConstraint("CK_StudySession_Minutes", "ActualMinutes > 0 AND ActualMinutes <= 1440");
                t.HasCheckConstraint("CK_StudySession_Planned", "PlannedMinutes IS NULL OR (PlannedMinutes > 0 AND PlannedMinutes <= 1440)");
            });
        });

        b.Entity<Note>(e =>
        {
            OwnedByUser(e);
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Content).HasMaxLength(20000);
            e.HasIndex(x => new { x.UserId, x.UpdatedAt });
            e.HasIndex(x => x.TopicId);
            e.HasIndex(x => x.ProjectId);
            e.HasIndex(x => x.ProjectTaskId);
            e.HasIndex(x => x.InterviewQuestionId);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.ClientSetNull);
            e.HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.ClientSetNull);
            e.HasOne(x => x.ProjectTask).WithMany().HasForeignKey(x => x.ProjectTaskId).OnDelete(DeleteBehavior.ClientSetNull);
            e.HasOne(x => x.InterviewQuestion).WithMany().HasForeignKey(x => x.InterviewQuestionId).OnDelete(DeleteBehavior.ClientSetNull);
            e.ToTable(t => t.HasCheckConstraint("CK_Note_SingleLink",
                "(CASE WHEN TopicId IS NULL THEN 0 ELSE 1 END + CASE WHEN ProjectId IS NULL THEN 0 ELSE 1 END + " +
                "CASE WHEN ProjectTaskId IS NULL THEN 0 ELSE 1 END + CASE WHEN InterviewQuestionId IS NULL THEN 0 ELSE 1 END) <= 1"));
        });

        b.Entity<ProjectTaskProgress>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.ProjectTaskId });
            e.Property(x => x.BlockedReason).HasMaxLength(500);
            e.HasOne(x => x.ProjectTask).WithMany(t => t.ProgressRows)
                .HasForeignKey(x => x.ProjectTaskId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PortfolioCheck>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.ProjectId, x.ChecklistItemId });
            e.HasOne(x => x.Project).WithMany(p => p.PortfolioChecks).HasForeignKey(x => x.ProjectId);
            e.HasOne(x => x.ChecklistItem).WithMany().HasForeignKey(x => x.ChecklistItemId);
        });

        b.Entity<ProjectRepository>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.ProjectId });
            e.Property(x => x.RepositoryUrl).HasMaxLength(500);
            e.HasOne(x => x.Project).WithMany(p => p.Repositories).HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PracticeProgress>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.ExerciseId });
            e.Property(x => x.UserAnswer).HasMaxLength(10000);
            e.Property(x => x.CheckedCriteria).HasMaxLength(200);
            e.ToTable(t => t.HasCheckConstraint("CK_PracticeProgress_Scores",
                "(LastScore IS NULL OR LastScore BETWEEN 0 AND 100) AND (BestScore IS NULL OR BestScore BETWEEN 0 AND 100)"));
            e.HasOne(x => x.Exercise).WithMany(x => x.ProgressRows)
                .HasForeignKey(x => x.ExerciseId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PlaygroundProject>(e =>
        {
            OwnedByUser(e);
            e.Property(x => x.Name).HasMaxLength(100);
            e.Property(x => x.Template).HasMaxLength(60);
            e.HasIndex(x => new { x.UserId, x.UpdatedAt });
        });

        b.Entity<CvDocument>(e =>
        {
            OwnedByUser(e);
            e.Property(x => x.Title).HasMaxLength(100);
            e.Property(x => x.TemplateKey).HasMaxLength(40);
            e.Property(x => x.PhotoContentType).HasMaxLength(20);
            e.Property(x => x.TailoredFor).HasMaxLength(150);
            e.HasIndex(x => new { x.UserId, x.UpdatedAt });
        });

        b.Entity<InterviewProgress>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.QuestionId });
            e.HasOne(x => x.Question).WithMany(x => x.ProgressRows)
                .HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ReviewSchedule>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.TopicId });
            e.HasIndex(x => new { x.UserId, x.NextReviewOn });
            e.HasOne(x => x.Topic).WithMany(t => t.ReviewRows)
                .HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<LearningPreference>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => x.UserId);
            e.ToTable(t => t.HasCheckConstraint("CK_LearningPreference_Goal", "DailyGoalMinutes BETWEEN 10 AND 600"));
        });

        b.Entity<UserTopicVideo>(e =>
        {
            OwnedByUser(e);
            e.HasIndex(x => new { x.UserId, x.TopicId, x.VideoId }).IsUnique();
            e.Property(x => x.VideoId).HasMaxLength(11);
            e.Property(x => x.Title).HasMaxLength(300);
            e.Property(x => x.ChannelTitle).HasMaxLength(200);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ProjectTaskVideo>(e =>
        {
            e.HasIndex(x => new { x.ProjectTaskId, x.VideoId }).IsUnique();
            e.Property(x => x.VideoId).HasMaxLength(11);
            e.Property(x => x.Title).HasMaxLength(300);
            e.Property(x => x.ChannelTitle).HasMaxLength(200);
            e.HasOne(x => x.ProjectTask).WithMany().HasForeignKey(x => x.ProjectTaskId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<QuizQuestion>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => x.TopicId);
            e.Property(x => x.Key).HasMaxLength(80);
            e.Property(x => x.QuestionEn).HasMaxLength(500);
            e.Property(x => x.QuestionAr).HasMaxLength(500);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<VideoProgress>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.VideoId });
            e.HasIndex(x => new { x.UserId, x.TopicId });
            e.Property(x => x.VideoId).HasMaxLength(11);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<QuizAttempt>(e =>
        {
            OwnedByUser(e);
            e.HasIndex(x => new { x.UserId, x.TopicId, x.Level });
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- Tutorials and challenges ----------
        b.Entity<TopicLesson>(e =>
        {
            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => new { x.TopicId, x.Order });
            e.Property(x => x.Key).HasMaxLength(120);
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
            e.Property(x => x.CodeLanguage).HasMaxLength(20);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PracticeSubmission>(e =>
        {
            OwnedByUser(e);
            e.HasIndex(x => new { x.UserId, x.ExerciseId, x.CreatedAt });
            e.HasOne(x => x.Exercise).WithMany().HasForeignKey(x => x.ExerciseId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- Developer level (Services/Skills) ----------
        b.Entity<QuizAnswer>(e =>
        {
            OwnedByUser(e);
            // SQL Server allows one cascade path: deleting an account removes its attempts, and the attempts remove their answers.
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
            e.HasIndex(x => new { x.UserId, x.QuestionId });
            e.HasOne(x => x.Attempt).WithMany(a => a.Answers).HasForeignKey(x => x.AttemptId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<XpTransaction>(e =>
        {
            OwnedByUser(e);
            e.Property(x => x.SourceKey).HasMaxLength(120);
            e.Property(x => x.Categories).HasMaxLength(300);
            // Idempotency: two requests that reconcile the same source at once collide here instead of both adding points.
            e.HasIndex(x => new { x.UserId, x.SourceKey, x.Seq }).IsUnique();
            e.HasIndex(x => new { x.UserId, x.CreatedAt });
        });

        b.Entity<ProjectAssessment>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.ProjectId });
            e.Property(x => x.Scores).HasMaxLength(2000);
            e.Property(x => x.Notes).HasMaxLength(4000);
            e.HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<LevelChange>(e =>
        {
            OwnedByUser(e);
            e.Property(x => x.Level).HasMaxLength(32);
            e.Property(x => x.PreviousLevel).HasMaxLength(32);
            e.HasIndex(x => new { x.UserId, x.ChangedAt });
        });

        // ---------- Community discussions ----------
        b.Entity<Discussion>(e =>
        {
            e.HasIndex(x => new { x.TopicId, x.IsPinned, x.CreatedAt });
            e.HasIndex(x => new { x.TopicId, x.Score });
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
            e.Property(x => x.BodyEn).HasMaxLength(4000);
            e.Property(x => x.BodyAr).HasMaxLength(4000);
            e.Property(x => x.AuthorId).HasMaxLength(450);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Author).WithMany().HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.AcceptedReply).WithOne().HasForeignKey<Discussion>(x => x.AcceptedReplyId).OnDelete(DeleteBehavior.NoAction);
        });

        b.Entity<DiscussionReply>(e =>
        {
            e.HasIndex(x => new { x.DiscussionId, x.CreatedAt });
            e.Property(x => x.BodyEn).HasMaxLength(4000);
            e.Property(x => x.BodyAr).HasMaxLength(4000);
            e.Property(x => x.AuthorId).HasMaxLength(450);
            e.HasOne(x => x.Discussion).WithMany(d => d.Replies).HasForeignKey(x => x.DiscussionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Author).WithMany().HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.SetNull);
        });

        b.Entity<DiscussionVote>(e =>
        {
            OwnedByUser(e);
            e.HasIndex(x => new { x.UserId, x.DiscussionId, x.ReplyId }).IsUnique().HasFilter(null);
            e.HasOne<Discussion>().WithMany().HasForeignKey(x => x.DiscussionId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne<DiscussionReply>().WithMany().HasForeignKey(x => x.ReplyId).OnDelete(DeleteBehavior.NoAction);
            e.ToTable(t => t.HasCheckConstraint("CK_DiscussionVote_Target",
                "(DiscussionId IS NOT NULL AND ReplyId IS NULL) OR (DiscussionId IS NULL AND ReplyId IS NOT NULL)"));
            e.ToTable(t => t.HasCheckConstraint("CK_DiscussionVote_Value", "Value IN (-1, 1)"));
        });

        b.Entity<Notification>(e =>
        {
            e.HasIndex(x => new { x.RecipientId, x.IsRead, x.CreatedAt });
            e.Property(x => x.RecipientId).HasMaxLength(450);
            e.Property(x => x.ActorId).HasMaxLength(450);
            e.Property(x => x.MessageEn).HasMaxLength(300);
            e.Property(x => x.MessageAr).HasMaxLength(300);
            e.HasOne(x => x.Recipient).WithMany().HasForeignKey(x => x.RecipientId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Discussion).WithMany().HasForeignKey(x => x.DiscussionId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Actor).WithMany().HasForeignKey(x => x.ActorId).OnDelete(DeleteBehavior.NoAction);
        });

        // ---------- Learning paths ----------
        b.Entity<LearningPath>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(80);
            e.Property(x => x.NameEn).HasMaxLength(150);
            e.Property(x => x.NameAr).HasMaxLength(150);
            e.Property(x => x.DescriptionEn).HasMaxLength(1000);
            e.Property(x => x.DescriptionAr).HasMaxLength(1000);
            e.Property(x => x.IconName).HasMaxLength(40);
            e.Property(x => x.CreatorId).HasMaxLength(450);
            e.HasOne(x => x.Creator).WithMany().HasForeignKey(x => x.CreatorId).OnDelete(DeleteBehavior.SetNull);
        });

        b.Entity<LearningPathPhase>(e =>
        {
            e.HasIndex(x => new { x.LearningPathId, x.PhaseId }).IsUnique();
            e.HasOne(x => x.LearningPath).WithMany(p => p.Phases).HasForeignKey(x => x.LearningPathId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Phase).WithMany().HasForeignKey(x => x.PhaseId).OnDelete(DeleteBehavior.NoAction);
        });

        b.Entity<LearningPathTopic>(e =>
        {
            e.HasIndex(x => new { x.LearningPathId, x.TopicId }).IsUnique();
            e.HasOne(x => x.LearningPath).WithMany(p => p.Topics).HasForeignKey(x => x.LearningPathId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.NoAction);
        });

        b.Entity<UserLearningPath>(e =>
        {
            OwnedByUser(e);
            e.HasIndex(x => new { x.UserId, x.LearningPathId }).IsUnique();
            e.HasOne(x => x.LearningPath).WithMany().HasForeignKey(x => x.LearningPathId).OnDelete(DeleteBehavior.NoAction);
        });

        // ---------- Shared caches ----------
        b.Entity<TopicVideoCache>(e =>
        {
            e.HasKey(x => x.TopicId);
            e.Property(x => x.Query).HasMaxLength(300);
            e.HasOne(x => x.Topic).WithOne().HasForeignKey<TopicVideoCache>(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- Accounts ----------
        b.Entity<AppUser>(e =>
        {
            e.Property(x => x.FullName).HasMaxLength(100);
            // Identity checks that emails are unique; the index makes the database guarantee it too.
            e.HasIndex(x => x.NormalizedEmail).IsUnique().HasFilter("[NormalizedEmail] IS NOT NULL");
            e.Property(x => x.PublicHandle).HasMaxLength(30);
            e.HasIndex(x => x.PublicHandle).IsUnique().HasFilter("[PublicHandle] IS NOT NULL");
        });
    }

    private void OwnedByUser<T>(EntityTypeBuilder<T> e) where T : class, IUserOwned
    {
        e.Property(x => x.UserId).HasMaxLength(450);
        e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        // EF re-reads CurrentUserId for every query, so each request sees only its own rows.
        e.HasQueryFilter(x => x.UserId == CurrentUserId);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        StampOwnership();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        StampOwnership();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    /// <summary>
    /// New user-owned rows get the signed-in user's id; changing or deleting a row that
    /// belongs to someone else throws. Services never set UserId themselves.
    /// </summary>
    private void StampOwnership()
    {
        ChangeTracker.DetectChanges();
        foreach (var entry in ChangeTracker.Entries<IUserOwned>())
        {
            switch (entry.State)
            {
                case EntityState.Added when string.IsNullOrEmpty(entry.Entity.UserId):
                    entry.Entity.UserId = CurrentUserId
                        ?? throw new InvalidOperationException($"{entry.Metadata.ClrType.Name} can only be created during a signed-in request.");
                    break;
                case EntityState.Added when CurrentUserId is not null && entry.Entity.UserId != CurrentUserId:
                case EntityState.Modified or EntityState.Deleted
                    when CurrentUserId is not null && (string?)entry.OriginalValues[nameof(IUserOwned.UserId)] != CurrentUserId:
                    throw new InvalidOperationException($"{entry.Metadata.ClrType.Name} belongs to another account.");
            }
        }
    }
}
