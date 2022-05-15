using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class WorldleParser : BasicScoreResultParser
    {
        private ILogger<WorldleParser> _logger;

        public WorldleParser(ILogger<WorldleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string GameName => "Worldle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"#{GameName} #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => Url;
        public override string Url => "https://worldle.teuteuf.fr";
    }
}
