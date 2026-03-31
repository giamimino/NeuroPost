import cookie from "cookie";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { verifyToken } from "@/lib/auth";
dotenv.config();

const port = Number(process.env.PORT) || 3001;

export const wss = new WebSocketServer({
  port,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024,
  },
  maxPayload: 1024 * 1024,
  verifyClient: (info, done) => {
    const cookieHeader = info.req.headers.cookie;

    if (!cookieHeader) {
      console.log("No cookies");
      return done(false, 401, "Unauthorized");
    }

    console.log(cookieHeader);

    const cookies = cookie.parse(cookieHeader);
    const token = cookies[process.env.ACCESS_COOKIE_NAME!];

    if (!token) {
      console.log("No access_token cookie");
      return done(false, 401, "Unauthorized");
    }

    try {
      verifyToken(token)
      return done(true);
    } catch (error) {
      console.log("Invalid JWT");
      return done(false, 401, "Unauthorized");
    }
  },
});
