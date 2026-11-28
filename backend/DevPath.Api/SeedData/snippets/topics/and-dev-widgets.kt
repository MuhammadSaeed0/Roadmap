class TasksWidget : GlanceAppWidget() {
    override val sizeMode = SizeMode.Responsive(setOf(DpSize(120.dp, 120.dp), DpSize(250.dp, 180.dp)))

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val tasks = AppDatabase.get(context).tasks().nextOpen(limit = 3)
        provideContent {
            GlanceTheme {
                Column(GlanceModifier.fillMaxSize().background(GlanceTheme.colors.surface).padding(12.dp)) {
                    Text("Today", style = TextStyle(fontWeight = FontWeight.Bold))
                    tasks.forEach { task ->
                        CheckBox(
                            checked = task.done,
                            onCheckedChange = actionRunCallback<ToggleTask>(actionParametersOf(TaskId to task.id)),
                            text = task.title,
                        )
                    }
                }
            }
        }
    }
}

class ToggleTask : ActionCallback {
    override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
        AppDatabase.get(context).tasks().toggle(parameters[TaskId]!!)
        TasksWidget().update(context, glanceId)
    }
}

val TaskId = ActionParameters.Key<String>("taskId")
