using DevPath.Api.Models;
using DevPath.Api.Services;
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
    : IdentityDbContext<AppUser>(options)
{
    /// <summary>The signed-in user's id, or null outside a request (start-up, seeding): user tables then read as empty.</summary>
    public string? CurrentUserId => currentUser?.Id;

    // Content (seeded)
    public DbSet<Phase> Phases => Set<Phase>();
    public DbSet<Topic> Topics => Set<Topic>();
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

        b.Entity<Topic>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasIndex(x => new { x.PhaseId, x.Order });
            e.HasIndex(x => x.Skill);
            e.Property(x => x.Slug).HasMaxLength(80);
            e.Property(x => x.TitleEn).HasMaxLength(200);
            e.Property(x => x.TitleAr).HasMaxLength(200);
            e.Property(x => x.CodeLanguage).HasMaxLength(20);
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
            e.HasOne(x => x.Exercise).WithMany(x => x.ProgressRows)
                .HasForeignKey(x => x.ExerciseId).OnDelete(DeleteBehavior.Cascade);
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

        b.Entity<VideoProgress>(e =>
        {
            OwnedByUser(e);
            e.HasKey(x => new { x.UserId, x.VideoId });
            e.HasIndex(x => new { x.UserId, x.TopicId });
            e.Property(x => x.VideoId).HasMaxLength(11);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
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
