using System;

namespace Curtme.Models
{
    public class UpdateLinkDto : CreateLinkDto
    {
        public String ShortURL { get; set; }

        public override Boolean IsValid()
        {
            return !String.IsNullOrEmpty(this.ShortURL) || this.IsValidSourceURL();
        }

        public Boolean IsValidSourceURL()
        {
            return base.IsValid();
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