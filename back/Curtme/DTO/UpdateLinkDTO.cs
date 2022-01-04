using System;

namespace Curtme.Models
{
    public class UpdateLinkDto : CreateLinkDto
    {
        public String ShortURL { get; set; }

        public Boolean? ToggleVisibility { get; set; }

        public override Boolean IsValid()
        {
            return this.ShouldUpdateShortUrl() || this.ShouldUpdateSourceURL() || this.ShouldToggleVisibility();
        }

        public Boolean ShouldToggleVisibility()
        {
            return this.ToggleVisibility.HasValue;
        }

        public Boolean ShouldUpdateSourceURL()
        {
            return !String.IsNullOrEmpty(this.SourceURL);
        }

        public Boolean ShouldUpdateShortUrl()
        {
            return !String.IsNullOrEmpty(this.ShortURL);
        }

        public Boolean IsValidShortURL()
        {
            return !String.IsNullOrEmpty(this.ShortURL) &&
                   this.ShortURL.Length >= ShortUrlConstants.LengthUpdateMin &&
                   this.ShortURL.Length <= ShortUrlConstants.LengthUpdateMax &&
                   this.HasShortURLValidCharacters();
        }

        private Boolean HasShortURLValidCharacters()
        {
            foreach (char character in this.ShortURL)
            {
                if (!ShortUrlConstants.ValidCharactersShortURL.Contains(character))
                    return false;
            }

            return true;
        }
    }
}