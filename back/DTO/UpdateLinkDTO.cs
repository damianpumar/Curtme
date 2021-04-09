using System;
using Curtme.Extensions;

namespace Curtme.Models
{
    public class UpdateLinkDTO : CreateLinkDTO
    {
        public String ShortURL { get; set; }

        public override Boolean IsValid()
        {
            return this.IsValidShortURL() || this.IsValidSourceURL();
        }

        public Boolean IsValidSourceURL()
        {
            return base.IsValid();
        }

        public Boolean IsValidShortURL()
        {
            return !String.IsNullOrEmpty(this.ShortURL);
        }
    }
}