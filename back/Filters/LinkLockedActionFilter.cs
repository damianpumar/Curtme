using System;
using System.Linq;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Hosting;

namespace Curtme.Filters
{
    public class LinkLockedActionFilter : ActionFilterAttribute
    {
        private readonly IWebHostEnvironment env;

        private readonly LinkService linkService;

        public LinkLockedActionFilter(IWebHostEnvironment env, LinkService linkService)
        {
            this.env = env;

            this.linkService = linkService;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var shortURL = context.ModelState.Values.SingleOrDefault();

            if (shortURL != null)
            {
                var link = this.linkService.GetByShortURL(shortURL.AttemptedValue);

                if (link != null && link.HasPassword)
                {
                    context.Result = new RedirectResult(this.GetRedirectURL(link));
                }
            }

            base.OnActionExecuting(context);
        }

        private String GetRedirectURL(Link link)
        {
            var baseURL = ".";

            if (this.env.IsDevelopment())
            {
                baseURL = "http://localhost:5555";
            }

            return $"{baseURL}/#/unlock/{link.ShortURL}";
        }
    }
}