using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class AbsurdleParser : BasicScoreResultParser
    {
        private ILogger<AbsurdleParser> _logger;

        public AbsurdleParser(ILogger<AbsurdleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override string GameName => "Absurdle";
        public override string? HelpText => "Start with today's random word.";
        protected override Regex Parser => new Regex($"{GameName} (?<{ScoreGroup}>\\d+)/");
        protected override string? ExtraContent => Url;
        public override string Url => "https://qntm.org/files/absurdle/absurdle.html";
    }
}
