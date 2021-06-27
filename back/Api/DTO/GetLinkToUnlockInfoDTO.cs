using System;

namespace Curtme.Models
{
    public class GetLinkToUnlockInfoDTO
    {
        public GetLinkToUnlockInfoDTO(Link link)
        {
            this.ShortURL = link.ShortURL;
            this.Title = link.Title;
        }

        public String ShortURL { get; }

        public String Title { get; }
    }
}