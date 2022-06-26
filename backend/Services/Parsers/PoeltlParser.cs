using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class PoeltlParser : BasicScoreResultParser
    {
        private ILogger<PoeltlParser> _logger;

        public PoeltlParser(ILogger<PoeltlParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override DateTime ActiveBefore => new DateTime(2022, 6, 26);
        public override string Category => "Other";
        public override string GameName => "Poeltl";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName} \\d+ - (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => null;
        public override string Url => "https://poeltl.dunk.town/";
    }
}
