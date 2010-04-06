# ===========================================================================
# Project:   Comet
# Copyright: ©2010 My Company, Inc.
# ===========================================================================

# Add initial buildfile information here
config :all, :required => :sproutcore

proxy '/messages', :to => '127.0.0.1:8000'