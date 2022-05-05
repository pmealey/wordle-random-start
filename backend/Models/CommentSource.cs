using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class CommentSource
    {
        [Required]
        public string CommentText { get; set; } = null!;
        [Required]
        public bool PostGame { get; set; } = false;
    }
}
