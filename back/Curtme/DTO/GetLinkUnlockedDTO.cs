using System;

namespace Curtme.Models
{
    public class GetLinkUnlockedDTO
    {
        public GetLinkUnlockedDTO(Link link)
        {
            this.SourceURL = link.SourceURL;
        }

        public String SourceURL { get; }
    }
}