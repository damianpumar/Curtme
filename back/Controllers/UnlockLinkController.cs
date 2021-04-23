using System;
using Curtme.Extensions;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Curtme.Controllers
{
    [ApiController]
    public class UnlockLinkController : ControllerBase
    {
        private readonly LinkService linkService;

        public UnlockLinkController(LinkDetailsService linkDetailsService, LinkService linkService)
        {
            this.linkService = linkService;
        }

        /// <summary>
        /// The user can lock or unlock password
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /linkId
        ///     {
        ///        linkId
        ///     }
        ///
        /// </remarks>
        /// <param name="linkId"></param>
        /// <param name="updatePasswordDTO"></param>
        /// <returns>Updated password link</returns>
        /// <response code="200">When the link was updated</response>
        /// <response code="400">If linkId is empty</response>
        /// <response code="404">If linkId does not exist</response>
        [HttpPut]
        [Route("lock/{linkId}")]
        public IActionResult Customize(String linkId, [FromBody] UpdatePasswordDTO updatePasswordDTO)
        {
            if (String.IsNullOrEmpty(linkId))
                return this.BadRequest(new { error = Constants.LINK_ID_REQUIRED_ERROR });

            var linkIn = this.linkService.GetById(linkId);

            if (linkIn == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            if (!String.IsNullOrEmpty(updatePasswordDTO.Password))
            {
                linkIn.Password = updatePasswordDTO.Password.GetSHA512();
            }
            else
            {
                linkIn.Password = null;
            }

            this.linkService.Update(linkIn);

            return this.Ok(linkIn);
        }

        /// <summary>
        /// This is the endpoint provide the information to unlock link
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET unlock/AAA123 (short URL)
        ///
        /// </remarks>
        /// <param name="shortURL"></param>
        /// <returns>Get link info to unlock</returns>
        /// <response code="200">Link info to unlock</response>
        /// <response code="400">If short url is null</response>
        /// <response code="404">If does not exist a link with that shortURL</response>
        [HttpGet]
        [Route("unlock/{shortURL}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult UnlockInfo(String shortURL)
        {
            if (String.IsNullOrEmpty(shortURL))
                return this.BadRequest(new { error = Constants.SHORT_URL_REQUIRED_ERROR });

            var link = this.linkService.GetByShortURL(shortURL);

            if (link == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            return this.Ok(new GetLinkToUnlockInfoDTO(link));
        }

        /// <summary>
        /// This endpoint provide longURL to redirect user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET unlock/AAA123 (short URL)
        ///     {
        ///        password: xxx
        ///     }
        ///
        /// </remarks>
        /// <param name="shortURL"></param>
        /// <param name="linkToUnlockDTO"></param>
        /// <returns>Get long url to redirect</returns>
        /// <response code="200">longURL to redirect</response>
        /// <response code="400">If short url is null</response>
        /// <response code="404">If does not exist a link with that shortURL</response>
        /// <response code="400">If password is null</response>
        /// <response code="401">If password do not match with link password</response>
        [HttpPost]
        [Route("unlock/{shortURL}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Unlock(String shortURL, [FromBody] LinkToUnlockDTO linkToUnlockDTO)
        {
            if (String.IsNullOrEmpty(shortURL))
                return this.BadRequest(new { error = Constants.SHORT_URL_REQUIRED_ERROR });

            if (String.IsNullOrEmpty(linkToUnlockDTO.Password))
                return this.BadRequest(new { error = Constants.NO_BODY_ERROR });

            var link = this.linkService.GetByShortURL(shortURL);

            if (link == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            if (link.Password != linkToUnlockDTO.Password.GetSHA512())
                return this.Unauthorized(new { error = Constants.PASSWORD_MISSMATCH });

            this.linkService.Visited(link, this.HttpContext.GetRequestInfo());

            return this.Ok(new GetLinkUnlockedDTO(link));
        }
    }
}