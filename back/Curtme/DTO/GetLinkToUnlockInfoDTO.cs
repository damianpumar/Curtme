using System;

namespace Curtme.Models
{
    public class GetLinkToUnlockInfoDto
    {
        public GetLinkToUnlockInfoDto(Link link)
        {
            this.ShortURL = link.ShortURL;
            this.Title = link.Title;
        }

        public String ShortURL { get; }

        public String Title { get; }
    }
}