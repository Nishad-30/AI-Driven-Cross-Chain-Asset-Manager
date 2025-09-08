import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Root route (health check)
 */
app.get("/", (req, res) => {
  res.send("Blockchain backend is running 🚀");
});

/**
 * ✅ Command + Transfer route (plaintext response)
 */
app.post("/command", async (req, res) => {
  const { command, wallet } = req.body;

  try {
    // Step 1: Fake parse
    const parsed = {
      action: "move",
      asset: "NFT",
      destination: "Ethereum",
      originalCommand: command,
    };

    // Step 2: Try Verbwire to get NFTs
    let mostValuable = null;
    try {
      const response = await axios.get(
        "https://api.verbwire.com/v1/nft/data/nftsForWallet",
        {
          params: {
            walletAddress: wallet,
            chain: "mumbai", // testnet for demo
          },
          headers: {
            "X-API-Key": process.env.VERBWIRE_API_KEY,
          },
        }
      );

      console.log("✅ Verbwire full response:", response.data);

      const nfts = response.data.nfts || [];
      mostValuable = nfts[0] || null; // pick first NFT for demo
    } catch (verbwireError) {
      console.warn(
        "⚠️ Verbwire error, falling back to mock NFT:",
        verbwireError.response?.data || verbwireError.message
      );
    }

    // Step 3: If no NFT found → return mock NFT
    if (!mostValuable) {
      mostValuable = {
        contractAddress: "0x1234567890abcdef",
        tokenId: "42",
        title: "Hackathon Demo NFT",
      };
    }

    // Step 4: Pretend to transfer (mock tx)
    const transaction = {
      txHash: "0xmocktransferhashabcdef123456",
      status: "success (mocked)",
      from: wallet,
      to: parsed.destination,
    };

    // Step 5: Build plaintext response
    const prettyMessage = `
      📝 Command Summary
      ─────────────────────────────
      ➡ Command    : ${parsed.originalCommand}
      ➡ Action     : ${parsed.action}
      ➡ Asset      : ${parsed.asset}
      ➡ Destination: ${parsed.destination}

      🎨 NFT Details
      ─────────────────────────────
      • Name            : ${mostValuable.title || "Unnamed NFT"}
      • Contract Address: ${mostValuable.contractAddress}
      • Token ID        : ${mostValuable.tokenId}
        
      🔗 Transaction Details
      ─────────────────────────────
      • Tx Hash : ${transaction.txHash}
      • Status  : ${transaction.status}
      • From    : ${transaction.from}
      • To      : ${transaction.to}
      `;

      res.json({ message: prettyMessage });

    // Send plaintext response
    res.type("text/plain").send(plaintextResponse.trim());
  } catch (error) {
    console.error("❌ Error in /command:", error.response?.data || error.message);
    res.status(500).type("text/plain").send("Failed to process command");
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
