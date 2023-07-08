const PORT = process.env.PORT || 3000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const allArticles = []

const singleNewspaperArticles = []

const newspapers = [
  {
    name: 'eltiempo',
    address: 'https://www.eltiempo.com/deportes/ciclismo',
    base: 'https://www.eltiempo.com',
  },
  {
    name: 'marca',
    address: 'https://www.marca.com/ciclismo.html',
    base: '',
  },
  {
    name: 'as',
    address: 'https://as.com/ciclismo/',
    base: 'https://as.com/ciclismo/',
  },
  {
    name: 'antena2',
    address: 'https://www.antena2.com/ciclismo',
    base: 'https://www.antena2.com',
  },
  {
    name: 'mundodeportivo',
    address: 'https://www.mundodeportivo.com/ciclismo',
    base: 'https://www.mundodeportivo.com',
  },
  {
    name: 'espn',
    address: 'https://www.espn.com.co/ciclismo/',
    base: 'https://www.espn.com.co',
  },
]

newspapers.forEach(newspaper => {
  axios.get(newspaper.address)
  .then(response => {
    const html = response.data
    const $ = cheerio.load(html)

    const urls = $('a').filter((i, element) => {
      return $(element).text().toLowerCase().includes("tour")
    })

    $(urls, html).each(function () {
      const title = $(this).text().replace(/(\s+)/g, ' ').trimEnd().trimStart()
      const url = $(this).attr('href')
      allArticles.push({
          title,
          url: url.includes('https') ? url : newspaper.base + url,
          source: newspaper.address,
      })
    })
  })
  .catch(err => console.log(err))
})

app.get('/', (req, res) => {
    res.json('Bienvenido a la API de noticias del Tour de France 2023')
})

app.get('/news', (req, res) => {
  res.json(allArticles)
})

app.get('/news/:newspaperName', (req, res) => {
  // Getting the url param
  const newspaperName = req.params.newspaperName

  // If the param matches the newspaper name in the array
  const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperName)[0].address 
  const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperName)[0].base

  axios.get(newspaperAddress)
  .then(response => {
    const html = response.data
    const $ = cheerio.load(html)

    const urls = $('a').filter((i, element) => {
      return $(element).text().toLowerCase().includes("tour")
    })

    $(urls, html).each(function (){
      const url = $(this).attr('href')
      const title = $(this).text().replace(/(\s+)/g, ' ').trimEnd().trimStart()

      singleNewspaperArticles.push({
        title,
        url: url.includes('https') ? url : newspaperBase + url,
        source: newspaperName
      })
    })
    res.json(singleNewspaperArticles)
  })
  .catch(err => console.log(err))
})


app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})