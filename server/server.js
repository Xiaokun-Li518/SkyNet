import express from 'express';
import * as dotenv from 'dotenv';

import cors from 'cors';

import { Configuration, OpenAIApi } from 'openai';

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
    const arr = ip.split(',');
    const firstValue = arr[0];

    const ipInfo = await fetch(`https://ipapi.co/${firstValue}/json/`)
    .then(response => response.json())
    .then(data => {
      return {
        city: data.city,
        region: data.region,
        country: data.country_name
      };
    })

    res.status(200).send ({
        message: "Hello, there",
        ip: `Your Ip Adderss is ${firstValue}`,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country
    })
});


app.post ('/', async (req, res) => {
    try {
        const prompt = req.body;
        const response = await openai.createChatCompletion ({
            model: "gpt-3.5-turbo",
            messages: prompt.messages
        });
        res.status(200).send ({
            bot: response.data.choices[0].message.content, 
        })
    } catch (error) {
        console.error(error)
        res.status(500).send(error || 'Something went wrong');
    }
})


app.post ('/image', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const response = await openai.createImage ({
            prompt: `${prompt}`,
            n: 2,
            size: "1024x1024"
        });
        console.log (response.data.data[0]);
        res.status(200).send ({
            urls: response?.data.data[0].url 
        })
    } catch (error) {
        console.error(error)
        res.status(500).send(error || 'Something went wrong');
    }
})

app.listen (7788, () => console.log ('Server is running on port http://localhost:7788'));