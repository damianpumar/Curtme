using System;
using System.Threading.Tasks;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Mvc;

namespace Curtme.Controllers
{
    [ApiController]
    public class LinkController : ControllerBase
    {
        private readonly LinkService linkService;

        public LinkController(LinkService linkService)
        {
            this.linkService = linkService;
        }

        [HttpPost]
        [Route("/")]
        public IActionResult Create(LinkDTO linkDTO)
        {
            var link = this.linkService.Create(linkDTO.URL);

            return this.Ok(link);
        }

        [HttpGet]
        [Route("/{shortURL}")]
        public IActionResult Visited(String shortURL)
        {
            var link = this.linkService.Get(shortURL);

            if (link == null)
                return this.NotFound();

            Task.Run(() => this.linkService.Visited(link));

            return this.Redirect(link.LongURL);
        }

        [HttpGet]
        [Route("/{shortURL}/stats")]
        public IActionResult Stats(String shortURL)
        {
            var link = this.linkService.Get(shortURL);

            if (link == null)
                return this.NotFound();

            return this.Ok(link);
        }
    }
}