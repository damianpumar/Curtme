using System;
using Microsoft.AspNetCore.Mvc;

namespace curtme.Controllers
{
    [ApiController]
    public class CutController : ControllerBase
    {
        [HttpPost]
        [Route("/")]
        public IActionResult Visit(String longLink)
        {
            return this.Ok(new { shortLink = "TODO" });
        }

        [HttpGet]
        [Route("/{token}")]
        public IActionResult Process(String token)
        {
            return this.Redirect("TODO");
        }

        [HttpGet]
        [Route("/{token}/stats")]
        public IActionResult Stats(String token)
        {
            return this.Ok(new { visit = 20 });
        }
    }
}