from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Sequence


@dataclass
class WorkoutEntry:
    activity: str
    duration_minutes: int
    calories_burned: int
    recorded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class HealthMetricEntry:
    metric: str
    value: float
    unit: str
    recorded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class MealEntry:
    name: str
    calories: int
    tags: List[str]
    violates_constraints: bool
    recorded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class FitApp:
    workouts: List[WorkoutEntry] = field(default_factory=list)
    health_metrics: List[HealthMetricEntry] = field(default_factory=list)
    meals: List[MealEntry] = field(default_factory=list)
    dietary_constraints: List[str] = field(default_factory=list)

    def add_workout(self, activity: str, duration_minutes: int, calories_burned: int) -> WorkoutEntry:
        workout = WorkoutEntry(
            activity=activity,
            duration_minutes=duration_minutes,
            calories_burned=calories_burned,
        )
        self.workouts.append(workout)
        return workout

    def add_health_metric(self, metric: str, value: float, unit: str) -> HealthMetricEntry:
        entry = HealthMetricEntry(metric=metric, value=value, unit=unit)
        self.health_metrics.append(entry)
        return entry

    def set_dietary_constraints(self, constraints: Sequence[str]) -> None:
        self.dietary_constraints = [constraint.lower() for constraint in constraints]

    def add_meal(self, name: str, calories: int, tags: Optional[Sequence[str]] = None) -> MealEntry:
        normalized_tags = [tag.lower() for tag in (tags or [])]
        violates = any(constraint in normalized_tags for constraint in self.dietary_constraints)
        meal = MealEntry(
            name=name,
            calories=calories,
            tags=normalized_tags,
            violates_constraints=violates,
        )
        self.meals.append(meal)
        return meal

    def summary(self) -> Dict[str, int]:
        return {
            "workouts": len(self.workouts),
            "health_metrics": len(self.health_metrics),
            "meals": len(self.meals),
            "dietary_constraints": len(self.dietary_constraints),
        }
