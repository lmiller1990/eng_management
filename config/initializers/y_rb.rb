# Explicitly require y-rb gem to make Y::Doc and other Y module constants available
# This is needed because y-rb_actioncable doesn't automatically require y-rb
require "y"
