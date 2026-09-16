import express from "express";
import Url from "../models/Url.js";
import { nanoid } from "nanoid";

const router = express.Router();

router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    let finalUrl = originalUrl?.trim();

    if (!finalUrl) {
      return res.status(400).json({ error: "Please enter a URL to shorten." });
    }

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      const parsedUrl = new URL(finalUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).json({ error: "Please provide a valid link starting with http:// or https://" });
      }
      const hostnameParts = parsedUrl.hostname.split('.');
      const tld = hostnameParts[hostnameParts.length - 1];
      if (parsedUrl.hostname !== 'localhost' && (!parsedUrl.hostname.includes('.') || !/^[a-zA-Z]{2,}$/.test(tld))) {
        return res.status(400).json({ error: "That doesn't look like a valid link. Please include a valid domain (like .com or .in)" });
      }
    } catch {
      return res.status(400).json({ error: "That doesn't look like a valid link. Please include http:// or https://" });
    }

    const baseUrl = process.env.BASE_URL;
    const deployedUrl = process.env.deployed_backend_url?.trim();
    
    if ((baseUrl && finalUrl.startsWith(baseUrl)) || 
        (deployedUrl && finalUrl.startsWith(deployedUrl))) {
      return res.status(400).json({ error: "This URL is already shortened and cannot be shortened further." });
    }

    const existingUrl = await Url.findOne({ originalUrl: finalUrl });
    if (existingUrl) {
      return res.json({
        shortId: existingUrl.shortId,
        shortUrl: `${process.env.BASE_URL}/${existingUrl.shortId}`,
      });
    }

    let url;
    let saved = false;
    let attempts = 0;

    while (!saved && attempts < 5) {
      try {
        const shortId = nanoid(7);
        url = await Url.create({
          shortId,
          originalUrl: finalUrl,
        });
        saved = true;
      } catch (err) {
        // 11000 is MongoDB's duplicate key error code
        if (err.code === 11000) {
          attempts++;
        } else {
          throw err;
        }
      }
    }

    if (!saved) {
      return res.status(500).json({ error: "Server is busy. Please try again." });
    }

    res.json({
      shortId: url.shortId,
      shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong on our server. Please try again later." });
  }
});

router.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });
    if (!url) return res.status(404).json({ error: "URL not found" });

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong on our server. Please try again later." });
  }
});

export default router;
