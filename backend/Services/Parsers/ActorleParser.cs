using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class ActorleParser : BasicScoreResultParser
    {
        private ILogger<ActorleParser> _logger;

        public ActorleParser(ILogger<ActorleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "Actorle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName} #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => "Play here: ";
        public override string Url => "https://actorle.com";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(ExtraContent, string.Empty).Replace(Url, string.Empty).Trim();
        }
    }
}
