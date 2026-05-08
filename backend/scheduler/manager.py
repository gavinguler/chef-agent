from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = BackgroundScheduler()

NL_TO_APD = {
    "maandag": "mon", "dinsdag": "tue", "woensdag": "wed",
    "donderdag": "thu", "vrijdag": "fri", "zaterdag": "sat", "zondag": "sun",
}


def reschedule_notification_jobs(settings_row) -> None:
    """Verwijder bestaande notificatiejobs en plan opnieuw op basis van DB-instellingen."""
    for job_id in ("daily_message", "shopping_reminder"):
        if scheduler.get_job(job_id):
            scheduler.remove_job(job_id)

    from backend.scheduler.daily_job import run_daily_job, run_shopping_job

    if settings_row.daily_enabled:
        scheduler.add_job(
            run_daily_job,
            CronTrigger(hour=settings_row.daily_hour, minute=settings_row.daily_minute),
            id="daily_message",
            replace_existing=True,
        )

    if settings_row.shopping_enabled and settings_row.shopping_days:
        days = [NL_TO_APD[d.strip()] for d in settings_row.shopping_days.split(",") if d.strip() in NL_TO_APD]
        if days:
            scheduler.add_job(
                run_shopping_job,
                CronTrigger(
                    day_of_week=",".join(days),
                    hour=settings_row.shopping_hour,
                    minute=settings_row.shopping_minute,
                ),
                id="shopping_reminder",
                replace_existing=True,
            )
