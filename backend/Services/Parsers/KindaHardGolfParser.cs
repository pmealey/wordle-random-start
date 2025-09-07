using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class KindaHardGolfParser : BasicScoreResultParser
    {
        private ILogger<KindaHardGolfParser> _logger;

        public KindaHardGolfParser(ILogger<KindaHardGolfParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Kinda Hard Golf";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"kindahard.golf.+?📝 (?<{ScoreGroup}>\\d+)", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://kindahard.golf";
    }
}
