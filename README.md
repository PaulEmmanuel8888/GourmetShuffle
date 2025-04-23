# GourmetShuffle

A **random meal generator** web application powered by [TheMealDB API](https://www.themealdb.com). Fetches recipes by random selection, search term, category, or location and displays:

- **Meal Details:** Name, category, area, ingredients with measurements, preparation steps in sentence case.  
- **Search & Filter:** Search by keyword, browse by category or location (area).  
- **Responsive Design:** Mobile-first layout with flexbox, media queries, and a clean grey-and-white theme.  
- **Interactive UI:** Sticky header, bottom-centered floating logo, styled images, and animated search bar.  

## 📦 Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/PaulEmmanuel8888/GourmetShuffle.git
   cd GourmetShuffle
2. **Install dependencies**
   ```bash
   npm install
3. **Run the app**
   ```bash
   node index.js
4. **Open http://localhost:3000 in your browser.**

No API key is required for the free MealDB endpoints used.

## 📁 Project Structure
   ```bash
   GourmetShuffle/
   ├── index.js             # Express server & route handlers
   ├── package.json         # Project metadata & dependencies
   ├── .gitignore
   ├── partials/            # Reusable EJS components
   │   ├── header.ejs
   │   ├── footer.ejs
   │   └── floating.ejs     # Bottom-centered logo
   ├── views/               # EJS templates
   │   ├── index.ejs        # Main/random/search view
   │   └── menu.ejs         # Category/location menu view
   └── public/
       ├── styles/
       │   └── styles.css   # Global styles & media queries
       └── images/          # Logos & placeholders.
```

## 🛠 Dependencies
- Express: Web framework

- EJS: Templating engine

- Axios: HTTP client

- Body-Parser: Request parsing middleware
## ⚖️ License
This project is licensed under the ISC License. Feel free to customize and extend!
