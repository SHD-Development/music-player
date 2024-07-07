-- CreateTable
CREATE TABLE "song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "lyricsPath" TEXT,
    "staticLyrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
