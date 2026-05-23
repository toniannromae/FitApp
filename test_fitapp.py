import unittest

from fitapp import FitApp


class FitAppTests(unittest.TestCase):
    def test_tracks_fitness_health_and_diet_data(self) -> None:
        app = FitApp()

        workout = app.add_workout("Run", duration_minutes=30, calories_burned=300)
        metric = app.add_health_metric("weight", value=72.3, unit="kg")
        app.set_dietary_constraints(["gluten", "nuts"])
        meal = app.add_meal("Salad", calories=220, tags=["vegetarian"])

        self.assertEqual(workout.activity, "Run")
        self.assertEqual(metric.metric, "weight")
        self.assertFalse(meal.violates_constraints)
        self.assertEqual(
            app.summary(),
            {"workouts": 1, "health_metrics": 1, "meals": 1, "dietary_constraints": 2},
        )

    def test_flags_meal_that_breaks_constraint(self) -> None:
        app = FitApp()
        app.set_dietary_constraints(["dairy"])

        meal = app.add_meal("Milkshake", calories=450, tags=["Dairy", "dessert"])

        self.assertTrue(meal.violates_constraints)
        self.assertEqual(meal.tags, ["dairy", "dessert"])


if __name__ == "__main__":
    unittest.main()
