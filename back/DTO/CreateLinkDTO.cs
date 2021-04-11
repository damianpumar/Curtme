using System;
using Curtme.Extensions;

namespace Curtme.Models
{
    public class CreateLinkDTO
    {
        public String SourceURL { get; set; }

        public virtual Boolean IsValid()
        {
            return !String.IsNullOrEmpty(this.SourceURL);
        }

        public Boolean IsValidURL()
        {
            return this.SourceURL.IsValidURL();
        }

        public String GetTitle()
        {
            return this.SourceURL.GetTitle();
        }
    }
}