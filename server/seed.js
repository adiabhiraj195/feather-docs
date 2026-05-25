import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./src/db/modle/index.js";

const DEFAULT_PASSWORD = "password123";

const doc1Content = JSON.stringify({
  blocks: [
    {
      key: "b1",
      text: "Project Roadmap 2026",
      type: "header-one",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "b2",
      text: "This roadmap outlines our core milestones for the feather-docs release.",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [
        { offset: 42, length: 12, style: "BOLD" }
      ],
      entityRanges: [],
      data: {}
    },
    {
      key: "b3",
      text: "Q1: Rich Text formatting toolbar stabilization.",
      type: "unordered-list-item",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "b4",
      text: "Q2: Collaborative socket synchronization optimization and real-time user indicator rendering.",
      type: "unordered-list-item",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }
  ],
  entityMap: {}
});

const doc2Content = JSON.stringify({
  blocks: [
    {
      key: "c1",
      text: "Marketing Strategy & Operations",
      type: "header-one",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "c2",
      text: "Leveraging organic traffic and social media presence to announce our lightweight document editor.",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "c3",
      text: "We should focus on developer-centric platform launches like Product Hunt, Hacker News, and GitHub trending lists.",
      type: "blockquote",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }
  ],
  entityMap: {}
});

const doc3Content = JSON.stringify({
  blocks: [
    {
      key: "d1",
      text: "Feather Docs API Reference",
      type: "header-one",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "d2",
      text: "All collaborative sync requests are multiplexed via socket.io rooms using document UUIDs or auto-incrementing numeric IDs.",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "d3",
      text: "socket.emit('send-changes', rawContentState)",
      type: "code-block",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }
  ],
  entityMap: {}
});

async function runSeed() {
  console.log("Connecting to the database...");
  try {
    await db.sequelize.authenticate();
    console.log("Database connection established successfully.");
    
    // Synchronize schemas (ensuring tables exist)
    await db.sequelize.sync();
    console.log("Database schemas synchronized.");

    // Clean up existing data to allow clean re-runs
    console.log("Cleaning up old test users, documents, and shares...");
    const testEmails = ["alice@example.com", "bob@example.com", "charlie@example.com"];
    
    // Find existing users to delete their documents/shares safely
    const existingUsers = await db.User.findAll({
      where: {
        email: testEmails
      }
    });
    
    const existingUserIds = existingUsers.map(u => u.id);
    if (existingUserIds.length > 0) {
      await db.DocumentUser.destroy({
        where: {
          email: testEmails
        }
      });
      await db.Document.destroy({
        where: {
          userId: existingUserIds
        }
      });
      await db.User.destroy({
        where: {
          email: testEmails
        }
      });
    }
    console.log("Cleanup complete.");

    // Create hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    console.log("Creating users...");
    const aliceToken = jwt.sign({ email: "alice@example.com" }, process.env.ACCESS_TOKEN_SECRET);
    const bobToken = jwt.sign({ email: "bob@example.com" }, process.env.ACCESS_TOKEN_SECRET);
    const charlieToken = jwt.sign({ email: "charlie@example.com" }, process.env.ACCESS_TOKEN_SECRET);

    const alice = await db.User.create({
      userName: "Alice Smith",
      email: "alice@example.com",
      password: hashedPassword,
      isVerified: true,
      verificationToken: aliceToken
    });

    const bob = await db.User.create({
      userName: "Bob Jones",
      email: "bob@example.com",
      password: hashedPassword,
      isVerified: true,
      verificationToken: bobToken
    });

    const charlie = await db.User.create({
      userName: "Charlie Brown",
      email: "charlie@example.com",
      password: hashedPassword,
      isVerified: true,
      verificationToken: charlieToken
    });

    console.log(`Users created successfully:
      - Alice Smith (alice@example.com)
      - Bob Jones (bob@example.com)
      - Charlie Brown (charlie@example.com)
      (Password for all: ${DEFAULT_PASSWORD})`);

    console.log("Creating documents...");
    
    const roadmapDoc = await db.Document.create({
      title: "Project Roadmap 2026",
      content: doc1Content,
      isPublic: false,
      userId: alice.id
    });

    const marketingDoc = await db.Document.create({
      title: "Marketing Strategy & Operations",
      content: doc2Content,
      isPublic: false,
      userId: bob.id
    });

    const apiDoc = await db.Document.create({
      title: "Feather Docs API Reference",
      content: doc3Content,
      isPublic: false,
      userId: charlie.id
    });

    console.log("Documents created successfully.");

    console.log("Creating document sharing mappings (DocumentUser)...");

    // Share Alice's Project Roadmap with Bob (EDIT) and Charlie (VIEW)
    await db.DocumentUser.create({
      documentId: roadmapDoc.id,
      userId: bob.id,
      permission: "EDIT",
      email: bob.email
    });

    await db.DocumentUser.create({
      documentId: roadmapDoc.id,
      userId: charlie.id,
      permission: "VIEW",
      email: charlie.email
    });

    // Share Bob's Marketing Strategy with Alice (EDIT)
    await db.DocumentUser.create({
      documentId: marketingDoc.id,
      userId: alice.id,
      permission: "EDIT",
      email: alice.email
    });

    // Share Charlie's API Reference with Alice (EDIT) and Bob (EDIT)
    await db.DocumentUser.create({
      documentId: apiDoc.id,
      userId: alice.id,
      permission: "EDIT",
      email: alice.email
    });

    await db.DocumentUser.create({
      documentId: apiDoc.id,
      userId: bob.id,
      permission: "EDIT",
      email: bob.email
    });

    console.log("Collaborative document shares created successfully!");
    console.log("Seeding process completed perfectly!");
    
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
}

runSeed();
