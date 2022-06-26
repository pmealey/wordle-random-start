using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class Crosswordle2Parser : BasicScoreResultParser
    {
        private ILogger<Crosswordle2Parser> _logger;

        public Crosswordle2Parser(ILogger<Crosswordle2Parser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string Category => "Word";
        public override string GameName => "Crosswordle 2";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"^Crosswordle \\d+ .*? (?<{ScoreGroup}>[\\d]+)/");
        protected override string? ExtraContent => Url;
        public override string Url => "https://crosswordle.serializer.ca/";
    }
}
