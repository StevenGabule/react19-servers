import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import lowdb from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { nanoid } from "nanoid";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  point: Point[];
}

interface Project {
  id: string;
  name: string;
  strokes: Stroke[];
  image: string;
}

let db = lowdb(new FileSync<{ projects: Project[] }>("drawing-db.json"));

db.defaults({
  projects: [
    {
      id: nanoid(),
      name: "Test projects",
      image: "http://placekitten.com/100/100",
    },
  ],
}).write();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = 4000;

app.get("/projects", (req, res) => {
  const data = db.get("projects").value();
  const projects = data.map((project) => ({
    id: project.id,
    name: project.name,
    image: project.image,
  }));
  res.json(projects);
});

app.post("/projects/new", (req, res) => {
  db.get("projects")
    .push({ ...req.body, id: nanoid() })
    .write();
  res.json({ success: true });
});

app.get("/projects/:projectId", (req, res) => {
  const { projectId } = req.params;
  const project = db.get("projects").find({ id: projectId }).value();

  if (project) {
    res.json({ success: true, project });
  } else {
    res.json({ success: false });
  }
});

app.listen(port, () => {
	console.log(`Backend running on http://localhost:${port}!`);
})