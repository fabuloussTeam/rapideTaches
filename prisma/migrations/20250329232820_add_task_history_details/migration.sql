-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "modifiedById" INTEGER NOT NULL,
    "changeDescription" TEXT NOT NULL,
    "modifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oldTitle" TEXT,
    "oldDescription" TEXT,
    "oldStatus" TEXT,
    "oldPriority" TEXT,
    CONSTRAINT "TaskHistory_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TaskHistory" ("changeDescription", "id", "modifiedAt", "modifiedById", "taskId") SELECT "changeDescription", "id", "modifiedAt", "modifiedById", "taskId" FROM "TaskHistory";
DROP TABLE "TaskHistory";
ALTER TABLE "new_TaskHistory" RENAME TO "TaskHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
