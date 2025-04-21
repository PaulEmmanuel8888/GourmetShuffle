import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const PORT = 3000;
const app = express();
const API_URL = "https://www.themealdb.com/api/json/v1/1";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", async (req, res) => {

    try {

    function toSentenceCase(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

    function getIngredients(meal) {
        const ingredients = [];
        
        for (let i = 1; i <= 30; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
        
            if (ingredient && ingredient.trim() !== "") {
                const formatted = ` ${measure ? measure.trim() : ""} ${toSentenceCase(ingredient.trim())}`;
                ingredients.push(formatted);
            }
        }
        
        return ingredients;
    }
        

    const response = await axios.get(API_URL+ '/random.php');
    const randomMeal = response.data.meals[0];

    let totalIngredients = getIngredients(randomMeal);


    const meal = {
        name: randomMeal.strMeal,
        category: randomMeal.strCategory,
        image: randomMeal.strMealThumb,
        instructions: randomMeal.strInstructions.split(/(?<=\.)\s+(?=[A-Z])/g).filter(s => s.trim() !== ""),
        ingredients: totalIngredients,
        location: randomMeal.strArea,
    }




    res.render("index.ejs", {meal: meal});

    
    } catch (error) {
     res.status(500).send("Internal Server Error");
    }
})

// Change this to POST if your form is POSTing
app.post('/search', async (req, res) => {
    try {
      const searchTerm = req.body.search;  // ensure your <form method="POST"…>
      const resp       = await axios.get(`${API_URL}/search.php?s=${encodeURIComponent(searchTerm)}`);
      const meals      = resp.data.meals || [];   // array or empty
  
      // helper from your GET "/"
      function toSentenceCase(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      function getIngredients(meal) {
        const ingredients = [];
        for (let i = 1; i <= 30; i++) {
          const ing = meal[`strIngredient${i}`];
          const msr = meal[`strMeasure${i}`];
          if (ing?.trim()) {
            ingredients.push(` ${msr?.trim() || ""} ${toSentenceCase(ing.trim())}`);
          }
        }
        return ingredients;
      }
  
      // map ALL meals into a new array
      const formattedMeals = meals.map(m => ({
        id:           m.idMeal,
        name:         m.strMeal,
        category:     m.strCategory,
        image:        m.strMealThumb,
        instructions: m.strInstructions
                          .split(/(?<=\.)\s+(?=[A-Z])/g)
                          .filter(s => s.trim()),
        ingredients:  getIngredients(m),
        location:     m.strArea,
      }));
  
      // Render ONCE, passing the entire array
      res.render('index.ejs', {
        // you can still pass a single “random” meal if you want fallback…
        random:  null,
        results: formattedMeals,
        query:   searchTerm
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
});

app.get("/getmeal/:mealID", async (req, res)=> {
    const { mealID } = req.params;
    try {
    
        const response = await axios.get(`${API_URL}/lookup.php?i=${encodeURIComponent(mealID)}`);
        const meal = response.data.meals?.[0];
        if (!meal) {
        return res.status(404).send('Meal not found');
        }

        function toSentenceCase(str) {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        function getIngredients(meal) {
        const ingredients = [];
        for (let i = 1; i <= 30; i++) {
            const ing = meal[`strIngredient${i}`];
            const msr = meal[`strMeasure${i}`];
            if (ing?.trim()) {
            ingredients.push(` ${msr?.trim() || ""} ${toSentenceCase(ing.trim())}`);
            }
        }
        return ingredients;
        }
    
        // format it just like you do for random/search
        const formatted = {
            name:         meal.strMeal,
            category:     meal.strCategory,
            image:        meal.strMealThumb,
            instructions: meal.strInstructions
                                    .split(/(?<=\.)\s+(?=[A-Z])/g)
                                    .filter(s => s.trim()),
            ingredients:  getIngredients(meal),
            location:     meal.strArea,
        };

        res.render("index.ejs", {meal: formatted});

        
    } catch (error) {
        console.error(err);
        res.status(500).send("Error fetching meal.");
    }


})
app.get('/category/:category', async (req, res) => {
    const { category } = req.params;
  
    try {
      // 1) Get the basic list of meals in this category
      const filterResp = await axios.get(
        `${API_URL}/filter.php?c=${encodeURIComponent(category)}`
      );
      const lightMeals = filterResp.data.meals || [];
  
      // 2) For each light meal, fire off a lookup request.
      //    This returns an array of Axios‐promise objects.
      const detailPromises = lightMeals.map(m =>
        axios.get(`${API_URL}/lookup.php?i=${encodeURIComponent(m.idMeal)}`)
      );
  
      // 3) Wait for ALL of them to finish
      const detailResponses = await Promise.all(detailPromises);
  
      // 4) Extract the full meal object from each response
      const fullMeals = detailResponses.map(r => r.data.meals[0]);
  
      // 5) Now format them exactly like in your other routes
      function toSentenceCase(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      function getIngredients(meal) {
        const ingredients = [];
        for (let i = 1; i <= 30; i++) {
          const ing = meal[`strIngredient${i}`];
          const msr = meal[`strMeasure${i}`];
          if (ing?.trim()) {
            ingredients.push(` ${msr?.trim() || ""} ${toSentenceCase(ing.trim())}`);
          }
        }
        return ingredients;
      }
  
      const formattedMeals = fullMeals.map(meal => ({
        id:           meal.idMeal,
        name:         meal.strMeal,
        category:     meal.strCategory,
        image:        meal.strMealThumb,
        instructions: meal.strInstructions
                            .split(/(?<=\.)\s+(?=[A-Z])/g)
                            .filter(s => s.trim()),
        ingredients:  getIngredients(meal),
        location:     meal.strArea,
      }));
  
      // 6) Render once with the full array
      res.render('index.ejs', {
        random:  null,
        results: formattedMeals,
        query:   category
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching detailed meals');
    }
});
  
app.get('/location/:location', async (req, res) => {
    const { location } = req.params;
  
    try {
      // 1) Get the basic list of meals in this category
      const filterResp = await axios.get(
        `${API_URL}/filter.php?a=${encodeURIComponent(location)}`
      );
      const lightMeals = filterResp.data.meals || [];
  
      // 2) For each light meal, fire off a lookup request.
      //    This returns an array of Axios‐promise objects.
      const detailPromises = lightMeals.map(m =>
        axios.get(`${API_URL}/lookup.php?i=${encodeURIComponent(m.idMeal)}`)
      );
  
      // 3) Wait for ALL of them to finish
      const detailResponses = await Promise.all(detailPromises);
  
      // 4) Extract the full meal object from each response
      const fullMeals = detailResponses.map(r => r.data.meals[0]);
  
      // 5) Now format them exactly like in your other routes
      function toSentenceCase(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      function getIngredients(meal) {
        const ingredients = [];
        for (let i = 1; i <= 30; i++) {
          const ing = meal[`strIngredient${i}`];
          const msr = meal[`strMeasure${i}`];
          if (ing?.trim()) {
            ingredients.push(` ${msr?.trim() || ""} ${toSentenceCase(ing.trim())}`);
          }
        }
        return ingredients;
      }
  
      const formattedMeals = fullMeals.map(meal => ({
        id:           meal.idMeal,
        name:         meal.strMeal,
        category:     meal.strCategory,
        image:        meal.strMealThumb,
        instructions: meal.strInstructions
                            .split(/(?<=\.)\s+(?=[A-Z])/g)
                            .filter(s => s.trim()),
        ingredients:  getIngredients(meal),
        location:     meal.strArea,
      }));
  
      // 6) Render once with the full array
      res.render('index.ejs', {
        random:  null,
        results: formattedMeals,
        query:   location
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching detailed meals');
    }
});


app.listen(PORT, (req, res) => {
    console.log(`Server running at port ${PORT}.`);
})