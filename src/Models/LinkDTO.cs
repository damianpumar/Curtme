using System;
using Curtme.Extensions;

namespace Curtme.Models
{
    public class LinkDTO
    {
        public String URL { get; set; }

        public Boolean IsValidURL()
        {
            return this.URL.IsValidURL();
        }
    }
}