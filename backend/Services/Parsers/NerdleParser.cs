using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class NerdleParser : BasicScoreResultParser
    {
        private ILogger<NerdleParser> _logger;

        public NerdleParser(ILogger<NerdleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string Category => "Other";
        public override string GameName => "Nerdle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName.ToLower()}game \\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => $"{Url} #nerdle";
        public override string Url => "https://nerdlegame.com";
    }
}
