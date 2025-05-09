/**
 * Database handling for Idiotagrama Patcher
 */

// Initialize Dexie database
const initDatabase = () => {
    const db = new Dexie("IdeogramDatabase");
    db.version(1).stores({
        urls: '++id, url' // Database to track processed URLs
    });
    return db;
};

// Check if URL exists in database
const urlExists = async (db, url) => {
    try {
        const existingUrl = await db.urls.where("url").equals(url).first();
        return !!existingUrl;
    } catch (error) {
        console.error('Error checking URL in database:', error);
        return false;
    }
};

// Add URL to database
const addUrlToDatabase = async (db, url) => {
    try {
        await db.urls.add({ url });
        return true;
    } catch (error) {
        console.error('Error adding URL to database:', error);
        return false;
    }
};

// Export database functions
window.idioDB = {
    initDatabase,
    urlExists,
    addUrlToDatabase
}; 