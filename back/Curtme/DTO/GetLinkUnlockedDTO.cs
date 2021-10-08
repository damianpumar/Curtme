using System;

namespace Curtme.Models
{
    public class GetLinkUnlockedDto
    {
        public GetLinkUnlockedDto(Link link)
        {
            this.SourceURL = link.SourceURL;
        }

        public String SourceURL { get; }
    }
}