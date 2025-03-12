import fs from "fs-extra";
import moment from "moment";
import readlineSync from "readline-sync";

interface Reminder {
  id: string;
  message: string;
  time: string; // Format: YYYY-MM-DD HH:mm
  completed: boolean;
}

class ReminderDatabase {
  private reminders: Map<string, Reminder>;
  private filename: string;

  constructor(filename: string = "reminders.json") {
    this.reminders = new Map<string, Reminder>();
    this.filename = filename;
    this.loadFromFile();
  }

  // Generate a unique 8-digit numeric ID
  private generateUniqueId(): string {
    let id: string;
    do {
      id = Math.floor(10000000 + Math.random() * 90000000).toString();
    } while (this.reminders.has(id)); // Ensure uniqueness
    return id;
  }

  // Create a new reminder with an 8-digit ID
  createReminder(message: string, time: string): string {
    const id = this.generateUniqueId();
    this.reminders.set(id, { id, message, time, completed: false });
    this.saveToFile();
    return `Reminder created with ID: ${id}`;
  }

  // Check if a reminder exists
  exists(id: string): boolean {
    return this.reminders.has(id);
  }

  // Mark a reminder as completed
  markReminderAsCompleted(id: string): string {
    if (!this.reminders.has(id)) return `Reminder ${id} not found.`;
    this.reminders.get(id)!.completed = true;
    this.saveToFile();
    return `Reminder ${id} marked as completed.`;
  }

  // Unmark a reminder as completed
  unmarkReminderAsCompleted(id: string): string {
    if (!this.reminders.has(id)) return `Reminder ${id} not found.`;
    this.reminders.get(id)!.completed = false;
    this.saveToFile();
    return `Reminder ${id} unmarked as completed.`;
  }

  // Get all reminders
  getAllReminders(): Reminder[] {
    return Array.from(this.reminders.values());
  }

  // Get a specific reminder
  getReminder(id: string): Reminder | null {
    return this.reminders.get(id) || null;
  }

  // Get all completed reminders
  getAllRemindersMarkedAsCompleted(): Reminder[] {
    return [...this.reminders.values()].filter(reminder => reminder.completed);
  }

  // Get all incomplete reminders
  getAllRemindersNotMarkedAsCompleted(): Reminder[] {
    return [...this.reminders.values()].filter(reminder => !reminder.completed);
  }

  // Get all reminders due by today
  getAllRemindersDueByToday(): Reminder[] {
    const today = moment().format("YYYY-MM-DD");
    return [...this.reminders.values()].filter(reminder =>
      moment(reminder.time).isSameOrBefore(today, "day")
    );
  }

  // Update an existing reminder
  updateReminder(id: string, message?: string, time?: string): string {
    if (!this.reminders.has(id)) return `Reminder ${id} not found.`;
    const reminder = this.reminders.get(id)!;
    if (message) reminder.message = message;
    if (time) reminder.time = time;
    this.reminders.set(id, reminder);
    this.saveToFile();
    return `Reminder ${id} updated.`;
  }

  // Delete a reminder
  removeReminder(id: string): string {
    if (!this.reminders.delete(id)) return `Reminder ${id} not found.`;
    this.saveToFile();
    return `Reminder ${id} deleted.`;
  }

  private saveToFile(): void {
    fs.writeJsonSync(this.filename, Array.from(this.reminders.entries()), { spaces: 2 });
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filename)) {
        const data = fs.readJsonSync(this.filename);
        this.reminders = new Map<string, Reminder>(data);
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
      this.reminders = new Map<string, Reminder>();
    }
  }
}

// ---------------- INTERACTIVE PROMPT ----------------
const db = new ReminderDatabase();

function promptUser(): void {
  while (true) {
    console.log("\nChoose an option:");
    console.log("1. Create Reminder");
    console.log("2. Retrieve Reminder");
    console.log("3. Update Reminder");
    console.log("4. Delete Reminder");
    console.log("5. Show All Reminders");
    console.log("6. Mark Reminder as Completed");
    console.log("7. Unmark Reminder as Completed");
    console.log("8. Show Completed Reminders");
    console.log("9. Show Pending Reminders");
    console.log("10. Show Due Reminders");
    console.log("11. Exit");

    const choice = readlineSync.question("Enter your choice: ");

    switch (choice) {
      case "1":
        const message = readlineSync.question("Enter reminder message: ");
        const time = readlineSync.question("Enter reminder time (YYYY-MM-DD HH:mm): ");
        console.log(db.createReminder(message, time));
        break;
      case "2":
        console.log(db.getReminder(readlineSync.question("Enter reminder ID: ")) || "Reminder not found.");
        break;
      case "3":
        const updateId = readlineSync.question("Enter reminder ID: ");
        const newMessage = readlineSync.question("Enter new message (leave blank to keep the same): ");
        const newTime = readlineSync.question("Enter new time (YYYY-MM-DD HH:mm) (leave blank to keep the same): ");
        console.log(db.updateReminder(updateId, newMessage || undefined, newTime || undefined));
        break;
      case "4":
        console.log(db.removeReminder(readlineSync.question("Enter reminder ID: ")));
        break;
      case "5":
        console.log(db.getAllReminders());
        break;
      case "6":
        console.log(db.markReminderAsCompleted(readlineSync.question("Enter reminder ID: ")));
        break;
      case "7":
        console.log(db.unmarkReminderAsCompleted(readlineSync.question("Enter reminder ID: ")));
        break;
      case "8":
        console.log(db.getAllRemindersMarkedAsCompleted());
        break;
      case "9":
        console.log(db.getAllRemindersNotMarkedAsCompleted());
        break;
      case "10":
        console.log(db.getAllRemindersDueByToday());
        break;
      case "11":
        console.log("Goodbye!");
        return;
      default:
        console.log("Invalid choice, please try again.");
    }
  }
}

// Start the interactive prompt
promptUser();
