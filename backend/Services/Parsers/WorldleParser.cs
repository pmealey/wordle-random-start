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

        private const int _priority = 1;
        public override int Priority => _priority;
        private const string _gameName = "Worldle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"#{_gameName} #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => _url;
        private const string _url = "https://worldle.teuteuf.fr";
        public override string Url => _url;
    }
}
