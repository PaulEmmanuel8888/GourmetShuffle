import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const PORT = 3000;
const app = express();
const API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";

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
        

    const response = await axios.get(API_URL);
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


app.listen(PORT, (req, res) => {
    console.log(`Server running at port ${PORT}.`);
})