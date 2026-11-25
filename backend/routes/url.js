import express from "express";
import { nanoid } from "nanoid";
import Url from "../models/Url.js";
import { optionalAuth, protect } from "../middleware/authMiddleware.js";

const GUEST_LINK_LIMIT = 2;
const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000;
const REUSE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // only reuse links with at least 7 days left
const MAX_URL_LENGTH = 2048;

const shortUrlFor = (shortId) => `${process.env.BASE_URL.trim().replace(/\/+$/, "")}/${shortId}`;

const hostOf = (value) => {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
};

// Returns { url } on success or { error } with a user-facing message.
const normalizeUrl = (input) => {
  if (typeof input !== "string" || !input.trim()) {
    return { error: "Please enter a URL to shorten." };
  }
  let finalUrl = input.trim();
  if (finalUrl.length > MAX_URL_LENGTH) {
    return { error: "That URL is too long. Please use a URL under 2048 characters." };
  }
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(finalUrl)) {
    finalUrl = "https://" + finalUrl;
  }

  let parsed;
  try {
    parsed = new URL(finalUrl);
  } catch {
    return { error: "That doesn't look like a valid link. Please check it and try again." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "Only links starting with http:// or https:// can be shortened." };
  }
  if (parsed.username || parsed.password) {
    return { error: "Links containing a username or password can't be shortened." };
  }
  const labels = parsed.hostname.split(".");
  const tld = labels[labels.length - 1];
  if (labels.length < 2 || !/^[a-z]{2,}$/i.test(tld)) {
    return { error: "That doesn't look like a valid link. Please include a valid domain (like .com or .in)" };
  }
  return { url: parsed.href };
};

export default function urlRoutes(redirectLimiter) {
  const router = express.Router();

  router.post("/shorten", optionalAuth, async (req, res) => {
    try {
      const { url: finalUrl, error } = normalizeUrl(req.body?.originalUrl);
      if (error) return res.status(400).json({ error });

      const ownHosts = [process.env.BASE_URL, process.env.FRONTEND_URL].map(hostOf).filter(Boolean);
      if (ownHosts.includes(hostOf(finalUrl))) {
        return res.status(400).json({ error: "This URL is already shortened and cannot be shortened further." });
      }

      const userId = req.user?.userId;
      const owner = userId ? { createdBy: userId } : { createdBy: null, ipAddress: req.ip };

      // Reuse this owner's recent link for the same URL instead of making a duplicate.
      const existing = await Url.findOne({
        originalUrl: finalUrl,
        ...owner,
        createdAt: { $gt: new Date(Date.now() - REUSE_WINDOW_MS) },
      });
      if (existing) {
        return res.json({ shortId: existing.shortId, shortUrl: shortUrlFor(existing.shortId) });
      }

      if (!userId) {
        const guestCount = await Url.countDocuments({
          createdBy: null,
          ipAddress: req.ip,
          createdAt: { $gt: new Date(Date.now() - GUEST_WINDOW_MS) },
        });
        if (guestCount >= GUEST_LINK_LIMIT) {
          return res.status(403).json({
            error: `You've used your ${GUEST_LINK_LIMIT} free links! Please log in to continue.`,
            code: "GUEST_LIMIT",
          });
        }
      }

      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const url = await Url.create({
            shortId: nanoid(7),
            originalUrl: finalUrl,
            createdBy: userId || null,
            ipAddress: req.ip,
          });
          return res.status(201).json({ shortId: url.shortId, shortUrl: shortUrlFor(url.shortId) });
        } catch (err) {
          if (err.code !== 11000) throw err; // 11000 = duplicate shortId, try again
        }
      }
      return res.status(500).json({ error: "Server is busy. Please try again." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong on our server. Please try again later." });
    }
  });

  // The logged-in user's links with click counts.
  router.get("/api/urls/mine", protect, async (req, res) => {
    try {
      const urls = await Url.find({ createdBy: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("shortId originalUrl clicks createdAt -_id")
        .lean();
      res.json(
        urls.map((u) => ({
          ...u,
          shortUrl: shortUrlFor(u.shortId),
          expiresAt: new Date(new Date(u.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000),
        })),
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Could not load your links. Please try again later." });
    }
  });

  router.get("/:shortId", redirectLimiter, async (req, res) => {
    const notFound = `${process.env.FRONTEND_URL.trim().replace(/\/+$/, "")}/not-found`;
    try {
      const { shortId } = req.params;
      if (!/^[A-Za-z0-9_-]{7}$/.test(shortId)) return res.redirect(notFound);

      // Atomic increment so simultaneous clicks are all counted.
      const url = await Url.findOneAndUpdate({ shortId }, { $inc: { clicks: 1 } }, { new: true });
      if (!url) return res.redirect(notFound);

      return res.redirect(url.originalUrl);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong on our server. Please try again later." });
    }
  });

  return router;
}
