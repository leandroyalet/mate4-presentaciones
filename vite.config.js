import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import colors from "picocolors";
import os from "os";
import { Server as SocketIOServer } from "socket.io";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const publicDir = resolve(__dirname, "public");
const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

function getInputEntries(includeRemote) {
  const srcPath = resolve(__dirname, "src");
  const entries = {};

  readdirSync(srcPath).forEach((name) => {
    const folderPath = join(srcPath, name);
    const indexHtmlPath = join(folderPath, "index.html");

    if (
      statSync(folderPath).isDirectory() &&
      (() => {
        try {
          return statSync(indexHtmlPath).isFile();
        } catch {
          return false;
        }
      })()
    ) {
      if (name != "remote") {
        entries[name] = indexHtmlPath;
      } else {
        if (includeRemote) {
          entries[name] = indexHtmlPath;
        }
      }
    }
  });

  return entries;
}

function socketIOPlugin() {
  let io;

  return {
    name: "vite-plugin-socketio",
    configureServer(server) {
      io = new SocketIOServer(server.httpServer);

      var host = false;
      var users = 0;

      io.on("connection", function (socket) {
        var user = {
          id: ++users,
        };

        if (host) host.emit("access", user);

        socket.on("host", function (_msg) {
          host = socket;
        });
        socket.on("move", function (msg) {
          if (host) {
            msg.user = user.id;
            host.volatile.emit("move", msg);
          }
        });
        socket.on("touch", function (msg) {
          if (host) {
            host.emit("touch", {
              user: user.id,
              type: msg.type,
            });
          }
        });
        socket.on("slide", function (msg) {
          if (host) {
            host.emit("slide", {
              user: user.id,
              type: msg.type,
            });
          }
        });
        socket.on("zoom", function (msg) {
          if (host) {
            host.emit("zoom", {
              user: user.id,
              type: msg.type,
            });
          }
        });
        socket.on("view", function (msg) {
          if (host) {
            host.emit("view", {
              user: user.id,
            });
          }
        });
        socket.on("disconnect", function (msg) {
          if (host) host.emit("exit", user.id);
        });
      });

      server.httpServer?.once("listening", () => {
        const address = server.config.server.host || "localhost";
        const port = server.config.server.port || 5173;
        const ip = getLocalNetworkIP();

        const colorUrl = (url) =>
          colors.cyan(
            url.replace(/:(\d+)\//, (_, port) => `:${colors.bold(port)}/`)
          );

        const local = `http://${address}:${port}${base}/remote/`;
        const network = `http://${ip}:${port}${base}/remote/`;
        console.log();
        console.info(
          `  ${colors.green("➜")}  ${colors.bold("Remote Local")}:   ${colorUrl(
            local
          )}`
        );
        console.info(
          `  ${colors.green("➜")}  ${colors.bold(
            "Remote Network"
          )}:   ${colorUrl(network)}`
        );
        console.log();
      });
    },
  };
}

const base = "/mate4-presentaciones";

export default defineConfig(({ command }) => {
  return {
    base,
    publicDir,
    root,
    plugins: [
      {
        name: "inject-app-links",
        transformIndexHtml(html) {
          const entries = getInputEntries();
          const relativePaths = Object.fromEntries(
            Object.keys(entries).map((name) => [name, `/${name}/`])
          );
          const links = Object.entries(relativePaths)
            .map(
              ([name, path]) => `<li><a href="${base}${path}">${name}</a></li>`
            )
            .join("\n");

          // Reemplaza <!-- APP_LINKS --> en el HTML
          return html.replace("<!-- APP_LINKS -->", `<ul>\n${links}\n</ul>`);
        },
      },
      ...(command === "serve" ? [socketIOPlugin()] : []),
    ],
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(root, "index.html"),
          ...getInputEntries(command === "serve"),
        },
      },
    },
  };
});
