using System;
using Curtme.Extensions;

namespace Curtme.Models
{
    public class LinkViewModel
    {
        public String URL { get; set; }

        public Boolean IsValidURL()
        {
            return this.URL.IsValidURL();
        }

        public Boolean TryGetTitle(out String title)
        {
            return this.URL.TryGetTitle(out title);
        }
    }
}