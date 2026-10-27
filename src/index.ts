import "dotenv/config"
import express, { type Request, type Response } from "express"
import AuthRouter from "./routes/auth.routers"
import articleRouter from "./routes/article.routers"
import mongoose from "mongoose"
import cors from "cors"

import dns, { setServers } from "node:dns"
dns. setServers(["8.8.8.8"])

const PORT = process.env.PORT 
const URL = process.env.MONGO_LOCAL_URL || ""

const app = express()

app.use(cors())

app.use(express.json())

app.use("/api/v1/auth", AuthRouter)
app.use("/api/v1/article", articleRouter);

mongoose
  .connect(URL)
  .then((res) => {
    console.log("DB Connected!")
    // only run when after db connected
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("DB Fail: ", err)
  })