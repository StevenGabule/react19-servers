import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import cors from 'cors'

const DATA_FILE = path.join(__dirname, "time-log-data.json");

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(cors())
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.get("/api/timers", (req, res) => {
  fs.readFile(DATA_FILE, (err, data: any) => {
    res.setHeader("Cache-Control", "no-cache");
    res.json(JSON.parse(data));
  });
});

app.post("/api/timers", (req, res) => {
  fs.readFile(DATA_FILE, (err, data: any) => {
    const timers = JSON.parse(data);
    const newTimer = {
      title: req.body.title,
      project: req.body.project,
      id: req.body.id,
      elapsed: 0,
      runningSince: null,
    };
    timers.push(newTimer);
    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.setHeader("Cache-Control", "no-cache");
      res.json(timers);
    });
  });
});

app.post("/api/timers/start", (req, res) => {
  fs.readFile(DATA_FILE, (err, data: any) => {
    const timers = JSON.parse(data);

    timers.forEach((timer: any) => {
      if (timer.id === req.body.id) {
        timer.runningSince = req.body.start;
      }
    });

    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});

app.post("/api/timers/stop", (req, res) => {
  fs.readFile(DATA_FILE, (err, data: any) => {
    const timers = JSON.parse(data);

    timers.forEach((timer: any) => {
      if (timer.id === req.body.id) {
        const delta = req.body.stop - timer.runningSince;
        timer.elapsed += delta;
        timer.runningSince = null;
      }
    });

    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});

app.put("/api/timers", (req, res) => {
  fs.readFile(DATA_FILE, (err, data: any) => {
    const timers = JSON.parse(data);

    timers.forEach((timer: any) => {
      if (timer.id === req.body.id) {
        timer.title = req.body.title;
        timer.project = req.body.project;
      }
    });

    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});

app.delete("/api/timers", (req, res) => {
  fs.readFile(DATA_FILE, (err, data: any) => {
    let timers = JSON.parse(data);

    timers = timers.reduce((memo: any, timer: any) => {
      if (timer.id === req.body.id) {
        return memo;
      } else {
        return memo.concat(timer);
      }
    }, []);

    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});

app.get("/molasses", (_, res) => {
  setTimeout(() => {
    res.end();
  }, 5000);
});

app.listen(app.get("port"), () => {
  console.log(`Server is running on port ${app.get("port")}`);
});
