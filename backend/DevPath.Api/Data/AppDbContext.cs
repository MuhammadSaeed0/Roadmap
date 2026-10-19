using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
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

    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        // Store every enum as a readable string such as 'Completed' instead of 2.
        builder.Properties<Enum>().HaveConversion<string>().HaveMaxLength(32);
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
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
            e.Property(x => x.RepositoryUrl).HasMaxLength(500);
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

        // ---------- User data ----------
        b.Entity<TopicProgress>(e =>
        {
            e.HasKey(x => x.TopicId);
            e.HasIndex(x => x.Status);
            e.HasOne(x => x.Topic).WithOne(t => t.Progress)
                .HasForeignKey<TopicProgress>(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
            e.ToTable(t => t.HasCheckConstraint("CK_TopicProgress_Confidence", "Confidence IS NULL OR (Confidence >= 0 AND Confidence <= 5)"));
        });

        b.Entity<StudySession>(e =>
        {
            e.HasIndex(x => x.SessionDate);
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
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Content).HasMaxLength(20000);
            e.HasIndex(x => x.UpdatedAt);
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
            e.HasKey(x => x.ProjectTaskId);
            e.Property(x => x.BlockedReason).HasMaxLength(500);
            e.HasOne(x => x.ProjectTask).WithOne(t => t.Progress)
                .HasForeignKey<ProjectTaskProgress>(x => x.ProjectTaskId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PortfolioCheck>(e =>
        {
            e.HasKey(x => new { x.ProjectId, x.ChecklistItemId });
            e.HasOne(x => x.Project).WithMany(p => p.PortfolioChecks).HasForeignKey(x => x.ProjectId);
            e.HasOne(x => x.ChecklistItem).WithMany().HasForeignKey(x => x.ChecklistItemId);
        });

        b.Entity<PracticeProgress>(e =>
        {
            e.HasKey(x => x.ExerciseId);
            e.Property(x => x.UserAnswer).HasMaxLength(10000);
            e.HasOne(x => x.Exercise).WithOne(x => x.Progress)
                .HasForeignKey<PracticeProgress>(x => x.ExerciseId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<InterviewProgress>(e =>
        {
            e.HasKey(x => x.QuestionId);
            e.HasOne(x => x.Question).WithOne(x => x.Progress)
                .HasForeignKey<InterviewProgress>(x => x.QuestionId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ReviewSchedule>(e =>
        {
            e.HasKey(x => x.TopicId);
            e.HasIndex(x => x.NextReviewOn);
            e.HasOne(x => x.Topic).WithOne(t => t.ReviewSchedule)
                .HasForeignKey<ReviewSchedule>(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<LearningPreference>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.ToTable(t => t.HasCheckConstraint("CK_LearningPreference_Goal", "DailyGoalMinutes BETWEEN 10 AND 600"));
        });
    }
}
