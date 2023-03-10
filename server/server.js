import express from 'express';
import * as dotenv from 'dotenv';

import cors from 'cors';

import {getClientIp } from 'request-ip';

import { Configuration, OpenAIApi } from 'openai';

import { appendFile } from 'fs/promises';


dotenv.config();


const configuration = new Configuration({
    apiKey : process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


const app = express();
app.use(cors());
app.use(express.json());


app.get ('/', async (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.status(200).send ({
        message: "Hello, there",
        ip: `Your Ip Adderss is ${ip}`
    })
});

app.post ('/', async (req, res) => {
    var clientIp = getClientIp(req);
    const newIp = clientIp + '\n';
    try {
        await appendFile ('log.txt', newIp);
    } catch (err) {
        
    }
    try {
        const prompt = req.body;
        const response = await openai.createChatCompletion ({
            "model": "gpt-3.5-turbo",
            "messages": prompt.messages
        });
        res.status(200).send ({
            bot: response.data.choices[0].message.content
        })
    } catch (error) {
        console.error(error)
        res.status(500).send(error || 'Something went wrong');
    }
})

app.listen (7788, () => console.log ('Server is running on port http://localhost:7788'));