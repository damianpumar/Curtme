using System;
using System.Linq;
using Curtme.Extensions;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Curtme.Controllers
{
    [ApiController]
    public class LinkDetailsController : ControllerBase
    {
        private readonly LinkDetailsService linkDetailsService;

        private readonly LinkService linkService;

        public LinkDetailsController(LinkDetailsService linkDetailsService, LinkService linkService)
        {
            this.linkDetailsService = linkDetailsService;

            this.linkService = linkService;
        }

        /// <summary>
        /// This endpoint is used to get detail for some link
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /details/linkId
        ///
        /// </remarks>
        /// <param name="linkId"></param>
        /// <returns>Link details</returns>
        /// <response code="200">With link details</response>
        /// <response code="400">If short url is null</response>
        /// <response code="404">If does not exist a link with that id or if current link is not from this logged in user</response>
        [HttpGet]
        [Route("/details/{linkId}")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetDetails(String linkId)
        {
            if (String.IsNullOrEmpty(linkId))
                return this.BadRequest(new { error = Constants.LINK_ID_REQUIRED_ERROR });

            var link = this.linkService.GetById(linkId);

            if (link == null || (!link.IsPublic && link.UserId != this.HttpContext.User.GetId()))
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            var details = this.linkDetailsService.GetDetails(linkId);

            if (!details.Any())
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_DETAILS_ERROR });

            return this.Ok(details);
        }
    }

}