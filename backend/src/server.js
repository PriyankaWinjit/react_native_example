import express from 'express';
import { ENV } from './config/env.js';
import { db } from './config/db.js';
import { favoritesTable } from './db/schema.js';
import { and, eq } from 'drizzle-orm';

const app = express();
const PORT = ENV.PORT;

app.use(express.json());
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
    if (!recipeId || !userId || !title
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newfavorite = await db.
      insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      }).returning();
    res.status(201).json(newfavorite[0]);
  } catch (error) {
    console.log("Error adding recipe to favorites:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete('/api/favorites/:userId/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId, } = req.params;
    await db
      .delete(favoritesTable)
      .where(
        and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );
  
    res.status(200).json({ message: 'Favorite deleted successfully' });
  } catch (error) {
    console.log("Error deleting favorite:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));
      
    res.status(200).json(favorites);
  } catch (error) {
    console.log("Error fetching favorites:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});